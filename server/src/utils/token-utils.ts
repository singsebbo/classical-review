import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

/**
 * Creates a jwt token meant for email verification.
 * @param {string} userId - User ID to incorporate in jwt.
 * @returns JSON web token that expires in 24 hours.
 */
export function createEmailVerificationToken(userId: string): string {
  const token: string = jwt.sign(
    { userId, purpose: "email_verification" },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
  return token;
}
