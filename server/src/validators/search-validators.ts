import { query, body, ValidationChain } from "express-validator";
import ComposerModel from "../models/composer-model";
import CompositionModel from "../models/composition-model";
import UserModel from "../models/user-model";

function validateSearchTerm(): ValidationChain {
  return query("term")
    .escape()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search term must be between 1 and 50 characters.");
}

function validateComposerId(): ValidationChain {
  return query("composerId")
    .exists()
    .withMessage("Composer ID must exist.")
    .bail()
    .custom(async (composerId: string): Promise<void> => {
      const composerExists: boolean = await ComposerModel.composerExists(
        composerId
      );
      if (!composerExists) {
        throw new Error("Composer does not exist.");
      }
    });
}

function validateCompositionId(): ValidationChain {
  return query("compositionId")
    .exists()
    .withMessage("Composition ID must exist.")
    .bail()
    .custom(async (compositionId: string): Promise<void> => {
      const compositionExists: boolean =
        await CompositionModel.compositionExists(compositionId);
      if (!compositionExists) {
        throw new Error("Composition does not exist.");
      }
    });
}

function validateUsername(): ValidationChain {
  return query("username")
    .exists()
    .withMessage("Username must exist.")
    .bail()
    .custom(async (username: string): Promise<void> => {
      const userExists: boolean = await UserModel.userExists({
        username: username,
      });
      if (!userExists) {
        throw new Error("User does not exist.");
      }
    });
}

/** Validates Express request for GET /api/search/composers */
export const searchComposersValidator: ValidationChain[] = [
  validateSearchTerm(),
];

/** Validates Express request for GET /api/search/compositions */
export const searchCompositionsValidator: ValidationChain[] = [
  validateSearchTerm(),
];

/** Validates Express request for GET /api/search/composer */
export const searchComposerValidator: ValidationChain[] = [
  validateComposerId(),
];

/** Validates Express request for GET /api/search/composition */
export const searchCompositionValidator: ValidationChain[] = [
  validateCompositionId(),
];

/** Validates Express request for GET /api/search/user */
export const searchUserValidator: ValidationChain[] = [validateUsername()];
