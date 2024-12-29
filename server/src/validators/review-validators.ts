import { body, ValidationChain } from "express-validator";
import CompositionModel from "../models/composition-model";
import profanities from "../utils/profanities";
import { getUserIdFromBearer } from "../utils/token-utils";
import { Review } from "../interfaces/entities";
import ReviewModel from "../models/review-model";

/**
 * Checks if text contains any profanity.
 * @param {string} text - Text to check.
 * @returns True if there is no profanity, false otherwise.
 */
function containsNoProfanity(text: string): boolean {
  text = text.toLowerCase();
  return !profanities.some((word: string): boolean => text.includes(word));
}

function validateComposition(): ValidationChain {
  return body("compositionId")
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

function validateRating(): ValidationChain {
  return body("rating")
    .exists()
    .withMessage("Rating must exist.")
    .bail()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5.");
}

function validateComment(): ValidationChain {
  return body("comment")
    .optional()
    .trim()
    .isAlphanumeric("en-US", { ignore: " " })
    .withMessage(
      "Comment must be alphanumeric and follow 'en-US' language code."
    )
    .bail()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Comment must be between 10 and 1000 characters.")
    .bail()
    .custom((comment: string): boolean => {
      return containsNoProfanity(comment);
    })
    .withMessage("Comment must not contain profanity.");
}

function validateReview(): ValidationChain {
  return body("reviewId")
    .exists()
    .withMessage("Review ID must exist.")
    .bail()
    .custom(async (reviewId: string, { req }): Promise<void> => {
      const userId: string = getUserIdFromBearer(
        req.headers!.authorization as string
      );
      const review: Review | null = await ReviewModel.getReview(reviewId);
      if (review === null) {
        throw new Error("Review does not exist.");
      }
      if (review.user_id !== userId) {
        throw new Error("Review does not match user ID.");
      }
    });
}

/** Validates Express request for POST /api/review/make-review */
export const makeReviewValidator: ValidationChain[] = [
  validateComposition(),
  validateRating(),
  validateComment(),
];

/** Validates Express request for DELETE /api/review/delete-review */
export const deleteReviewValidator: ValidationChain[] = [validateReview()];

/** Validates Express request for PUT /api/review/change-review */
export const changeReviewValidator: ValidationChain[] = [
  /**
   * @todo Check reviewID
   * @todo Check rating
   * @todo Check new comment
   */
];
