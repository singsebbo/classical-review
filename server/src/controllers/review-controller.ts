import { Request, Response, NextFunction } from "express";
import { getUserIdFromBearer } from "../utils/token-utils";
import { ReviewData } from "../interfaces/request-interfaces";
import ReviewModel from "../models/review-model";
import UserModel from "../models/user-model";

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
    /**
     * @todo Get compositionId, rating, and comment if it exists
     * @todo Extract the userId from the bearer token
     * @todo Check if the review already exists
     * @todo Insert the review into the reviews database under the user
     * @todo Edit the user's review data
     * @todo Edit the compositions review data
     * @todo Edit the composer's review data
     * @todo Send back the response
     */
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
  } catch (error: unknown) {
    next(error);
  }
}
