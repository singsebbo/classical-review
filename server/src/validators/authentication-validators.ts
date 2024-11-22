import { ValidationChain } from "express-validator";

/** Validates all routes requiring a bearer token */
export const bearerTokenValidator: ValidationChain[] = [
  /**
   * @todo Check if access token exists
   * @todo Check if access token is a JWT
   * @todo Check if access token is for the purpose of access and signed properly
   */
];
