import {
  body,
  cookie,
  Meta,
  Result,
  ValidationChain,
  ValidationError,
  validationResult,
} from "express-validator";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import UserModel from "../models/user-model";
import profanities from "../utils/profanities";
import { JWT_SECRET } from "../config";
import { isValidPassword } from "../utils/password-utils";

/**
 * Checks if text contains any profanity.
 * @param {string} text - Text to check.
 * @returns True if there is no profanity, false otherwise.
 */
function containsNoProfanity(text: string): boolean {
  text = text.toLowerCase();
  return !profanities.some((word: string): boolean => text.includes(word));
}

/**
 * Checks if a token is a valid email verification token.
 * @param {string} token - The token to check.
 * @returns True if the token is valid, throws an error otherwise.
 * @throws A JsonWebTokenError if the token is invalid.
 * @explanation
 * This function only returns true and throws an error otherwise because each error provides
 * specific information for our express-validator ValidationChain. If it were to return false,
 * then the error handler middleware would process a fairly vague error as this function would
 * bundle all the possible errors into "false".
 */
function isValidEmailVerificationToken(token: string): boolean {
  // Token will contain userId if purpose is email_verification
  const decoded: jwt.JwtPayload = jwt.verify(
    token,
    JWT_SECRET
  ) as jwt.JwtPayload;
  if (decoded.purpose !== "email_verification") {
    throw new JsonWebTokenError(
      "Token is not for the purpose of email verification."
    );
  }
  return true;
}

/**
 * Checks if a token is a valid refresh token.
 * @param {string} token - The token to check.
 * @returns True if the token is valid, throws an error otherwise.
 * @throws A JsonWebTokenError if the token is invalid.
 * @explanation
 * This function only returns true and throws an error otherwise because each error provides
 * specific information for our express-validator ValidationChain. If it were to return false,
 * then the error handler middleware would process a fairly vague error as this function would
 * bundle all the possible errors into "false".
 */
function isValidRefreshToken(token: string): boolean {
  // Token will contain userId if purpose is refresh
  const decoded: jwt.JwtPayload = jwt.verify(
    token,
    JWT_SECRET
  ) as jwt.JwtPayload;
  if (decoded.purpose !== "refresh") {
    throw new JsonWebTokenError("Token is not a refresh token.");
  }
  return true;
}

function validateUsername(): ValidationChain {
  return body("username")
    .exists()
    .withMessage("Username field must exist.")
    .bail()
    .isString()
    .withMessage("Username must be a string.")
    .bail()
    .trim()
    .escape()
    .isLength({ min: 2, max: 32 })
    .withMessage("Username must be between 2 and 32 characters long.")
    .bail()
    .isAlphanumeric("en-US")
    .withMessage(
      'Username must follow "en-US" language code and can not contain symbols.'
    )
    .bail()
    .custom((username: string): boolean => {
      return containsNoProfanity(username);
    })
    .withMessage("Username must not contain profanity.")
    .bail()
    .custom(async (username: string): Promise<void> => {
      const isUsernameUnique: boolean = await UserModel.isUsernameUnique(
        username
      );
      if (!isUsernameUnique) {
        throw new Error();
      }
    })
    .withMessage("Username is already in use.");
}

function validateEmail(): ValidationChain {
  return body("email")
    .exists()
    .withMessage("Email field must exist.")
    .bail()
    .isString()
    .withMessage("Email must be a string.")
    .bail()
    .normalizeEmail()
    .isEmail()
    .withMessage("Email address must be in standard format.")
    .bail()
    .custom(async (email: string): Promise<void> => {
      const isEmailUnique: boolean = await UserModel.isEmailUnique(email);
      if (!isEmailUnique) {
        throw new Error();
      }
    })
    .withMessage("Email is already in use.");
}

function validatePassword(): ValidationChain {
  return body("password")
    .exists()
    .withMessage("Password field must exist.")
    .bail()
    .isString()
    .withMessage("Password must be a string.")
    .bail()
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must be between 8-64 characters.")
    .bail()
    .isAlphanumeric("en-US", { ignore: "!@#$%^&*" })
    .withMessage(
      'Password must be alphanumeric following "en-US" language code exluding the characters "!@#$%^&*".'
    )
    .bail()
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
    })
    .withMessage(
      "Password must contain at least one lowercase, one uppercase, and one number."
    );
}

function validEmailVerificationToken(): ValidationChain {
  return body("token")
    .exists()
    .withMessage("Verification token must exist.")
    .bail()
    .isString()
    .withMessage("Verification token must be a string.")
    .bail()
    .isJWT()
    .withMessage("Token is not a JWT.")
    .bail()
    .custom((token: string): boolean => {
      return isValidEmailVerificationToken(token);
    });
}

function validLoginUsername(): ValidationChain {
  return body("username")
    .exists()
    .withMessage("Username field must exist.")
    .bail()
    .isString()
    .withMessage("Username must be a string.")
    .bail()
    .custom(async (username: string): Promise<void> => {
      await UserModel.userExistsAndIsVerified({ username: username });
    });
}

function validLoginPassword(): ValidationChain {
  return body("password")
    .exists()
    .withMessage("Password field must exist.")
    .bail()
    .isString()
    .withMessage("Password must be a string.")
    .bail()
    .custom(async (password: string, { req }: Meta): Promise<void> => {
      // If an error exists from validLoginUsername, it won't show two errors
      const errors: Result<ValidationError> = validationResult(req);
      if (!errors.isEmpty()) {
        return Promise.resolve();
      }

      const username: string = req.body.username;
      const passwordHash: string = await UserModel.getPasswordHash({
        username: username,
      });
      const isCorrectPassword: boolean = await isValidPassword(
        password,
        passwordHash
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect password.");
      }
    });
}

function validRefreshToken(): ValidationChain {
  return cookie("refreshToken")
    .exists()
    .withMessage("Refresh token is missing.")
    .bail()
    .isJWT()
    .withMessage("Refresh token is invalid.")
    .bail()
    .custom((refreshToken: string): boolean => {
      return isValidRefreshToken(refreshToken);
    });
}

/** Validates Express request for POST /api/account/register */
export const registerUserValidator: ValidationChain[] = [
  validateUsername(),
  validateEmail(),
  validatePassword(),
];

/** Validates Express request for POST /api/account/verify-email */
export const verifyEmailValidator: ValidationChain[] = [
  validEmailVerificationToken(),
];

/** Validates Express request for POST /api/account/login */
export const loginValidator: ValidationChain[] = [
  validLoginUsername(),
  validLoginPassword(),
];

/** Validates Express request for POST /api/account/logout */
export const logoutValidator: ValidationChain[] = [validRefreshToken()];

/** Validates Express request for POST /api/account/refresh */
export const refreshValidator: ValidationChain[] = [validRefreshToken()];
