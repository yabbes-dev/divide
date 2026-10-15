import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 32;
const DUMMY_SALT = "00000000000000000000000000000000";
const DUMMY_HASH = "00".repeat(KEY_LENGTH);

export async function hashCode(code: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(code, salt, KEY_LENGTH)) as Buffer;
  return { hash: derived.toString("hex"), salt };
}

export async function codeMatches(
  code: string,
  salt: string,
  hash: string,
): Promise<boolean> {
  const derived = (await scryptAsync(code, salt, KEY_LENGTH)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/** Spend the same scrypt time when the username does not exist. */
export async function burnCodeCheck(code: string): Promise<void> {
  await codeMatches(code, DUMMY_SALT, DUMMY_HASH);
}
