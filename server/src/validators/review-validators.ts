import { ValidationChain } from "express-validator";

/** Validates Express request for POST /api/review/make-review */
export const makeReviewValidator: ValidationChain[] = [
  /**
   * @todo Check if compositionId field exists
   * @todo Check if compositionId exists in the database
   * @todo Check if rating field exists
   * @todo Check if rating is between 1 and 5
   * @todo Trim the comment of spaces on the left and right
   * @todo If comment exists, check if it is in the character limit
   * @todo If comment exists, check for profanity
   */
];
