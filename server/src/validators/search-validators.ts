import { query, ValidationChain } from "express-validator";

function validateSearchTerm(): ValidationChain {
  return query("term")
    .escape()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search term must be between 1 and 50 characters.");
}

/** Validates Express request for GET /api/search/composers */
export const searchComposersValidator: ValidationChain[] = [
  validateSearchTerm(),
];
