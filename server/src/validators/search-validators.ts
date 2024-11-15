import { query, ValidationChain } from "express-validator";

function validateSearchTerm(): ValidationChain {
  return query("term")
    .exists()
    .withMessage("Search term must not be empty.")
    .bail()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search term must be between 1 and 50 characters.")
    .escape()
    .trim();
}

/** Validates Express request for GET /api/search/composers */
export const searchComposersValidator: ValidationChain[] = [
  validateSearchTerm(),
];
