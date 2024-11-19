import { Request, Response, NextFunction } from "express";
import { Composer, Composition, Review, User } from "../interfaces/entities";
import ComposerModel from "../models/composer-model";
import CompositionModel from "../models/composition-model";
import ReviewModel from "../models/review-model";
import UserModel from "../models/user-model";

/**
 * Searches for composers given a search term.
 * @param {Request} req - The request object containing search query term.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function searchComposers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const term: string = req.query.term as string;
    const composers: Composer[] = await ComposerModel.getComposers(term);
    res.status(200).json({
      success: true,
      composers: composers,
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Searches for compositions given a search term.
 * @param {Request} req - The request object containing search query term.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function searchCompositions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const term: string = req.query.term as string;
    const compositions: Composition[] = await CompositionModel.getCompositions(
      term
    );
    res.status(200).json({
      success: true,
      compositions: compositions,
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Gets composer data given a composer ID.
 * @param {Request} req - The request object containing composer ID.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function searchComposer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const composerId: string = req.body.composer_id;
    const composerData: Composer = await ComposerModel.getComposer(composerId);
    const composerWorks: Composition[] =
      await CompositionModel.getComposerWorks(composerId);
    res.status(200).json({
      success: true,
      composer: composerData,
      compositions: composerWorks,
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Gets composition data given a composition ID.
 * @param {Request} req - The request object containing composition ID.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function searchComposition(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const compositionId: string = req.body.composition_id;
    const compositionData: Composition = await CompositionModel.getComposition(
      compositionId
    );
    const reviewData: Review[] = await ReviewModel.getCompositionReviews(
      compositionId
    );
    res.status(200).json({
      success: true,
      composition: compositionData,
      reviews: reviewData,
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Gets user data given a username.
 * @param {Request} req - The request object containing the username.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function searchUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const username: string = req.body.username;
    const userData: User = await UserModel.getUser({ username });
    const reviewData: Review[] = await ReviewModel.getUserReviews(
      userData.user_id
    );
    const userDisplayData: Partial<User> = {
      user_id: userData.user_id,
      username: username,
      bio: userData.bio,
      created_at: userData.created_at,
      profile_picture_url: userData.profile_picture_url,
      average_review: userData.average_review,
      total_reviews: userData.total_reviews,
    };
    res.status(200).json({
      success: true,
      user: userDisplayData,
      reviews: reviewData,
    });
  } catch (error: unknown) {
    next(error);
  }
}
