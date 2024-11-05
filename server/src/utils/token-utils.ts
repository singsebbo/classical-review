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

/**
 * Gets the userId from a JSON web token.
 * @param {string} token - The JSON web token.
 * @returns The userId from the decoded token.
 * @remarks
 * Should only be used when a token has already been verified. The token must also contain the
 * userId, otherwise it will throw an error.
 */
export function getUserIdFromToken(token: string): string {
  const decodedToken: jwt.JwtPayload = jwt.decode(token) as jwt.JwtPayload;
  return decodedToken.userId;
}
