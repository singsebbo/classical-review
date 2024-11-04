import { body, ValidationChain } from "express-validator";
import UserModel from "../models/user-model";
import profanities from "../utils/profanities";

function containsNoProfanity(text: string): boolean {
  text = text.toLowerCase();
  return !profanities.some((word: string): boolean => text.includes(word));
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
    .isAlpha("en-US")
    .withMessage('Username must follow "en-US" language code.')
    .bail()
    .custom((username: string): boolean => {
      return containsNoProfanity(username);
    })
    .withMessage("Username must not contain profanity.")
    .bail()
    .custom(async (username: string): Promise<boolean> => {
      return await UserModel.isUsernameUnique(username);
    });
}

function validateEmail(): ValidationChain {
  return body("email")
    .exists()
    .withMessage("Email field must exist.")
    .bail()
    .isString()
    .withMessage("Email must be a string.")
    .normalizeEmail()
    .isEmail()
    .withMessage("Email address must be in standard format.")
    .bail()
    .isLength({ max: 100 })
    .withMessage("Email address must be at most 100 characters.")
    .bail()
    .custom(async (email: string): Promise<boolean> => {
      return await UserModel.isEmailUnique(email);
    });
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

/** Validates express request for POST /api/account/register */
export const registerUserValidator: ValidationChain[] = [
  validateUsername(),
  validateEmail(),
  validatePassword(),
];
