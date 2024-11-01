import { body, ValidationChain } from "express-validator";
import { Filter } from "bad-words";

function containsNoProfanity(text: string): boolean {
  const filter: Filter = new Filter();
  return !filter.isProfane(text);
}

function validateUsername(): ValidationChain {
  return body("username")
    .trim()
    .escape()
    .exists()
    .withMessage("Username field must be exist.")
    .bail()
    .isString()
    .withMessage("Username must be a string.")
    .bail()
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
    .custom((username: string): boolean => {
      // Insert code to check if username exists already
      return true;
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
    .custom((email: string): boolean => {
      // Insert code to check if email exists already
      return true;
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
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be between 8-32 characters.")
    .bail()
    .isAlphanumeric("en-US", { ignore: "!@#$%^&*()" })
    .withMessage(
      'Password must be alphanumeric following "en-US" language code exluding the characters "!@#$%^&*()".'
    )
    .bail()
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      returnScore: false,
    })
    .withMessage(
      "Password must contain at least one lowercase, one uppercase, and one number."
    );
}
