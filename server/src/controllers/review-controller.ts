import { Request, Response, NextFunction } from "express";
import { getUserIdFromBearer } from "../utils/token-utils";
import { ReviewData } from "../interfaces/request-interfaces";
import ReviewModel from "../models/review-model";
import UserModel from "../models/user-model";
import { Composition } from "../interfaces/entities";
import CompositionModel from "../models/composition-model";
import ComposerModel from "../models/composer-model";

/**
 * Creates a review of a composition.
 * @param {Request} req - The request object containing the review data.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function makeReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { compositionId, rating, comment } = req.body;
    const userId: string = getUserIdFromBearer(
      req.headers.authorization as string
    );
    const reviewData: ReviewData = {
      composition_id: compositionId,
      user_id: userId,
      rating: rating,
      comment: comment ? comment : null,
    };
    const reviewExists: boolean = await ReviewModel.userReviewExists(
      compositionId,
      userId
    );
    if (reviewExists) {
      res.status(409).json({
        success: false,
        message: "Review already exists on this composition.",
      });
      return;
    }
    await ReviewModel.insertReview(reviewData);
    await UserModel.incrementReviewData(rating, userId);
    const composition: Composition = await CompositionModel.incrementReviewData(
      rating,
      compositionId
    );
    await ComposerModel.incrementReviewData(rating, composition.composer_id);
    res.status(201).json({
      success: true,
      message: "Review has been successfully created",
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Deletes a review of a composition.
 * @param {Request} req - The request object containing the reviewId.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @todo Get the reviewId from the request
     * @todo Delete the review
     * @todo Send a response
     */
  } catch (error: unknown) {
    next(error);
  }
}
