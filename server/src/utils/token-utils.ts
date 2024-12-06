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
 * Create a jwt refresh token.
 * @param {string} userId - User ID to incorporate in jwt.
 * @returns JSON web token meant for refresh that expires in 180 days.
 */
export function createRefreshToken(userId: string): string {
  const token: string = jwt.sign({ userId, purpose: "refresh" }, JWT_SECRET, {
    expiresIn: "180d",
  });
  return token;
}

/**
 * Create a jwt access token.
 * @param {string} userId - User ID to incorporate in jwt.
 * @returns JSON web token meant for access that expires in 1 hour.
 */
export function createAccessToken(userId: string): string {
  const token: string = jwt.sign({ userId, purpose: "access" }, JWT_SECRET, {
    expiresIn: "15m",
  });
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

/**
 * Gets the userId from the bearer Authorization header
 * @param {string} token - The authorization header
 * @returns The userId from the token
 * @remarks
 * Should only be used when the token has already been verified. The token must also contain the
 * userId, otherwise it will throw an error.
 */
export function getUserIdFromBearer(token: string): string {
  const bearerToken: string = token.split(" ")[1];
  return getUserIdFromToken(bearerToken);
}
