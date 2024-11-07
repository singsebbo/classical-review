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

/**
 * Checks if the unhashed password matches the hashed password.
 * @param {string} password - The unhashed password.
 * @param {string} passwordHash - The hashed password.
 * @returns A promise that resolves to a boolean representing the result of the comparison.
 */
export async function isValidPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}
