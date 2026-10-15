import { toTitleCase } from "@/lib/utils/format";

const USERNAME_PATTERN = /^[A-Za-z0-9]+(?:[ ._-][A-Za-z0-9]+)*$/;

export function normalizeUsername(input: string): string | null {
  const username = input.trim().replace(/\s+/g, " ");
  if (username.length < 2 || username.length > 24) return null;
  if (!USERNAME_PATTERN.test(username)) return null;
  return username;
}

export function usernameKey(username: string): string {
  return username.toLowerCase();
}

export function normalizeCode(input: string): string | null {
  const code = input.trim();
  if (!/^\d{4}$/.test(code)) return null;
  return code;
}

export function normalizeGroupName(input: string): string | null {
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 40) return null;
  return name;
}

export function groupNameKey(name: string): string {
  return name.toLowerCase();
}

/** Title-case, drop blanks and duplicates, require at least two people. */
export function normalizeMembers(names: string[]): string[] | null {
  const members: string[] = [];

  for (const raw of names) {
    const name = toTitleCase(raw);
    if (!name || name.length > 40) return null;
    if (members.some((member) => member.toLowerCase() === name.toLowerCase())) {
      continue;
    }
    members.push(name);
  }

  if (members.length < 2) return null;
  return members;
}

export function sameMemberSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const a = left.map((name) => name.trim().toLowerCase()).sort();
  const b = right.map((name) => name.trim().toLowerCase()).sort();
  return a.every((name, index) => name === b[index]);
}
