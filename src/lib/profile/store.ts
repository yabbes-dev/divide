import type { PostgrestError } from "@supabase/supabase-js";

import { burnCodeCheck, codeMatches, hashCode } from "@/lib/profile/code";
import { ProfileError } from "@/lib/profile/errors";
import {
  clearSessionToken,
  hashToken,
  newSessionToken,
  readSessionToken,
  sessionExpiryDate,
  writeSessionToken,
} from "@/lib/profile/session";
import {
  groupNameKey,
  normalizeCode,
  normalizeGroupName,
  normalizeMembers,
  normalizeUsername,
  usernameKey,
} from "@/lib/profile/validation";
import { getAdminClient } from "@/lib/supabase/admin";
import type { Profile, ProfileSnapshot, SavedGroup } from "@/types/profile";

const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS_PER_USERNAME = 8;
const MAX_ATTEMPTS_PER_IP = 30;

interface ProfileRow {
  id: string;
  username: string;
  code_hash: string;
  code_salt: string;
}

interface GroupMemberRow {
  display_name: string;
  sort_order: number;
}

interface GroupRow {
  id: string;
  name: string;
  group_members: GroupMemberRow[] | null;
}

function mapDbError(error: PostgrestError, fallback: string): ProfileError {
  if (error.code === "23505") {
    if (error.message.includes("profiles_username")) {
      return new ProfileError("That username is taken.");
    }
    if (error.message.includes("groups_name")) {
      return new ProfileError("You already have a group with that name.");
    }
  }

  if (error.code === "42P01" || error.code === "PGRST205") {
    return new ProfileError(
      "Profiles aren't ready yet. Run the Supabase SQL setup once.",
      503,
    );
  }

  console.error(fallback, error.code);
  return new ProfileError("Something went wrong. Try again.", 500);
}

function toSavedGroup(row: GroupRow): SavedGroup {
  const members = [...(row.group_members ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return {
    id: row.id,
    name: row.name,
    members: members.map((member) => member.display_name),
  };
}

async function listGroups(profileId: string): Promise<SavedGroup[]> {
  const db = getAdminClient();
  const { data, error } = await db
    .from("groups")
    .select("id, name, group_members(display_name, sort_order)")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true });

  if (error) throw mapDbError(error, "list groups");
  return ((data ?? []) as GroupRow[]).map(toSavedGroup);
}

async function openSession(profileId: string): Promise<void> {
  const db = getAdminClient();
  const token = newSessionToken();
  const { error } = await db.from("sessions").insert({
    token_hash: hashToken(token),
    profile_id: profileId,
    expires_at: sessionExpiryDate().toISOString(),
  });

  if (error) throw mapDbError(error, "create session");
  await writeSessionToken(token);
}

async function assertLoginAllowed(key: string, ip: string): Promise<void> {
  const db = getAdminClient();
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MS).toISOString();

  const [byUsername, byIp] = await Promise.all([
    db
      .from("login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("username_key", key)
      .gte("created_at", since),
    db
      .from("login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since),
  ]);

  if (byUsername.error) throw mapDbError(byUsername.error, "rate limit username");
  if (byIp.error) throw mapDbError(byIp.error, "rate limit ip");

  if (
    (byUsername.count ?? 0) >= MAX_ATTEMPTS_PER_USERNAME ||
    (byIp.count ?? 0) >= MAX_ATTEMPTS_PER_IP
  ) {
    throw new ProfileError("Too many tries. Wait a few minutes and try again.", 429);
  }
}

async function recordFailedLogin(key: string, ip: string): Promise<void> {
  const db = getAdminClient();
  const { error } = await db.from("login_attempts").insert({
    username_key: key,
    ip,
  });
  if (error) console.error("record login attempt", error.code);

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await db.from("login_attempts").delete().lt("created_at", dayAgo);
}

async function clearFailedLogins(key: string): Promise<void> {
  const db = getAdminClient();
  await db.from("login_attempts").delete().eq("username_key", key);
}

export async function getProfileSnapshot(): Promise<ProfileSnapshot> {
  const token = await readSessionToken();
  if (!token) {
    return { configured: true, profile: null, groups: [] };
  }

  const db = getAdminClient();
  const tokenHash = hashToken(token);
  const { data, error } = await db
    .from("sessions")
    .select("profile_id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) throw mapDbError(error, "read session");
  if (!data) return { configured: true, profile: null, groups: [] };

  if (new Date(data.expires_at).getTime() <= Date.now()) {
    await db.from("sessions").delete().eq("token_hash", tokenHash);
    await clearSessionToken();
    return { configured: true, profile: null, groups: [] };
  }

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id, username")
    .eq("id", data.profile_id)
    .maybeSingle();

  if (profileError) throw mapDbError(profileError, "read profile");
  if (!profile) return { configured: true, profile: null, groups: [] };

  const groups = await listGroups(profile.id);
  return {
    configured: true,
    profile: { id: profile.id, username: profile.username },
    groups,
  };
}

export async function signUp(
  rawUsername: string,
  rawCode: string,
): Promise<ProfileSnapshot> {
  const username = normalizeUsername(rawUsername);
  const code = normalizeCode(rawCode);

  if (!username) {
    throw new ProfileError("Use 2–24 letters or numbers.");
  }
  if (!code) {
    throw new ProfileError("Enter a 4-digit code.");
  }

  const db = getAdminClient();
  const key = usernameKey(username);
  const { data: existing, error: existingError } = await db
    .from("profiles")
    .select("id")
    .eq("username_key", key)
    .maybeSingle();

  if (existingError) throw mapDbError(existingError, "check username");
  if (existing) throw new ProfileError("That username is taken.");

  const { hash, salt } = await hashCode(code);
  const { data: created, error } = await db
    .from("profiles")
    .insert({
      username,
      username_key: key,
      code_hash: hash,
      code_salt: salt,
    })
    .select("id, username")
    .single();

  if (error) throw mapDbError(error, "create profile");

  const profile = created as Pick<ProfileRow, "id" | "username">;
  await openSession(profile.id);

  return {
    configured: true,
    profile: { id: profile.id, username: profile.username },
    groups: [],
  };
}

export async function signIn(
  rawUsername: string,
  rawCode: string,
  ip: string,
): Promise<ProfileSnapshot> {
  const username = normalizeUsername(rawUsername);
  const code = normalizeCode(rawCode);

  if (!username) {
    throw new ProfileError("Enter your username.");
  }
  if (!code) {
    throw new ProfileError("Enter your 4-digit code.");
  }

  const key = usernameKey(username);
  await assertLoginAllowed(key, ip);

  const db = getAdminClient();
  const { data, error } = await db
    .from("profiles")
    .select("id, username, code_hash, code_salt")
    .eq("username_key", key)
    .maybeSingle();

  if (error) throw mapDbError(error, "find profile");

  const profile = data as ProfileRow | null;
  const matches = profile
    ? await codeMatches(code, profile.code_salt, profile.code_hash)
    : false;

  if (!profile) {
    await burnCodeCheck(code);
  }

  if (!profile || !matches) {
    await recordFailedLogin(key, ip);
    throw new ProfileError("That username or code doesn't match.");
  }

  await clearFailedLogins(key);
  await openSession(profile.id);
  const groups = await listGroups(profile.id);

  return {
    configured: true,
    profile: { id: profile.id, username: profile.username },
    groups,
  };
}

export async function signOut(): Promise<void> {
  const token = await readSessionToken();
  if (token) {
    const db = getAdminClient();
    await db.from("sessions").delete().eq("token_hash", hashToken(token));
  }
  await clearSessionToken();
}

async function requireProfile(): Promise<Profile> {
  const snapshot = await getProfileSnapshot();
  if (!snapshot.profile) {
    throw new ProfileError("Sign in to save groups.", 401);
  }
  return snapshot.profile;
}

export async function createGroup(
  rawName: string,
  rawMembers: string[],
): Promise<SavedGroup> {
  const profile = await requireProfile();
  const name = normalizeGroupName(rawName);
  const members = normalizeMembers(rawMembers);

  if (!name) throw new ProfileError("Name the group.");
  if (!members) throw new ProfileError("Add at least two people.");

  const db = getAdminClient();
  const { data, error } = await db
    .from("groups")
    .insert({
      profile_id: profile.id,
      name,
      name_key: groupNameKey(name),
    })
    .select("id, name")
    .single();

  if (error) throw mapDbError(error, "create group");

  const group = data as { id: string; name: string };
  const { error: memberError } = await db.from("group_members").insert(
    members.map((displayName, sortOrder) => ({
      group_id: group.id,
      display_name: displayName,
      sort_order: sortOrder,
    })),
  );

  if (memberError) {
    await db.from("groups").delete().eq("id", group.id);
    throw mapDbError(memberError, "create group members");
  }

  return { id: group.id, name: group.name, members };
}

export async function deleteGroup(groupId: string): Promise<void> {
  const profile = await requireProfile();
  const db = getAdminClient();
  const { data, error } = await db
    .from("groups")
    .delete()
    .eq("id", groupId)
    .eq("profile_id", profile.id)
    .select("id")
    .maybeSingle();

  if (error) throw mapDbError(error, "delete group");
  if (!data) throw new ProfileError("That group is already gone.", 404);
}
