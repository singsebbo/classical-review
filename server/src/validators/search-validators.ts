import { query, ValidationChain } from "express-validator";

function validateSearchTerm(): ValidationChain {
  return query("term");
  /**
   * @todo
   */
}

/** Validates Express request for GET /api/search/composers */
export const searchComposersValidator: ValidationChain[] = [
  validateSearchTerm(),
];
