import { query, body, ValidationChain } from "express-validator";
import ComposerModel from "../models/composer-model";

function validateSearchTerm(): ValidationChain {
  return query("term")
    .escape()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search term must be between 1 and 50 characters.");
}

function validateComposerId(): ValidationChain {
  return body("composerId")
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
