import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hashes and returns the hashed password.
 * @param {string} password - The password to hash.
 * @returns The hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}
