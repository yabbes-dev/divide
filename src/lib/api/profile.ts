import type { ProfileSnapshot, SavedGroup } from "@/types/profile";

interface ApiError {
  error?: string;
}

async function readJson<T>(response: Response): Promise<T & ApiError> {
  return (await response.json()) as T & ApiError;
}

export async function fetchProfile(): Promise<ProfileSnapshot & { error?: string }> {
  const response = await fetch("/api/profile", { cache: "no-store" });
  const body = await readJson<ProfileSnapshot>(response);
  if (!response.ok) {
    return {
      configured: true,
      profile: null,
      groups: [],
      error: body.error ?? "Couldn't load your profile.",
    };
  }
  return body;
}

export async function createProfile(
  username: string,
  code: string,
): Promise<ProfileSnapshot & { error?: string }> {
  const response = await fetch("/api/profile/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, code }),
  });
  const body = await readJson<ProfileSnapshot>(response);
  if (!response.ok) {
    return { configured: true, profile: null, groups: [], error: body.error ?? "Couldn't create that profile." };
  }
  return body;
}

export async function loginProfile(
  username: string,
  code: string,
): Promise<ProfileSnapshot & { error?: string }> {
  const response = await fetch("/api/profile/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, code }),
  });
  const body = await readJson<ProfileSnapshot>(response);
  if (!response.ok) {
    return { configured: true, profile: null, groups: [], error: body.error ?? "Couldn't sign in." };
  }
  return body;
}

export async function logoutProfile(): Promise<string | null> {
  const response = await fetch("/api/profile/logout", { method: "POST" });
  if (!response.ok) {
    const body = await readJson<ApiError>(response);
    return body.error ?? "Couldn't sign out.";
  }
  return null;
}

export async function saveGroup(
  name: string,
  members: string[],
): Promise<{ group?: SavedGroup; error?: string }> {
  const response = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, members }),
  });
  const body = await readJson<{ group?: SavedGroup }>(response);
  if (!response.ok || !body.group) {
    return { error: body.error ?? "Couldn't save that group." };
  }
  return { group: body.group };
}

export async function removeGroup(id: string): Promise<string | null> {
  const response = await fetch(`/api/groups/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const body = await readJson<ApiError>(response);
    return body.error ?? "Couldn't delete that group.";
  }
  return null;
}
