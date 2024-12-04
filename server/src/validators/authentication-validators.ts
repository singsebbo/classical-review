import { header, ValidationChain } from "express-validator";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { JWT_SECRET } from "../config";

/**
 * Checks if a token is a valid access token.
 * @param {string} token - The token to check.
 * @returns True if the token is valid, throws an error otherwise.
 * @throws A JsonWebTokenError if the token is invalid.
 * @explanation
 * This function only returns true and throws an error otherwise because each error provides
 * specific information for our express-validator ValidationChain. If it were to return false,
 * then the error handler middleware would process a fairly vague error as this function would
 * bundle all the possible errors into "false".
 */
function isValidAccessToken(token: string): boolean {
  // Token will contain userId if purpose is access
  const decoded: jwt.JwtPayload = jwt.verify(
    token,
    JWT_SECRET
  ) as jwt.JwtPayload;
  if (decoded.purpose !== "access") {
    throw new JsonWebTokenError("Token is not an access token.");
  }
  return true;
}

function validateAccessToken(): ValidationChain {
  return header("Authorization")
    .exists()
    .withMessage("Authorization header must exist.")
    .bail()
    .custom(async (auth: string): Promise<void> => {
      if (!auth.startsWith("Bearer ")) {
        throw new Error("Authorization header must be a bearer.");
      }
      const token = auth.split(" ")[1];
      if (!token) {
        throw new Error("Bearer token is missing.");
      }
      isValidAccessToken(token);
    });
}

/** Validates all routes requiring a bearer token */
export const bearerTokenValidator: ValidationChain[] = [validateAccessToken()];
