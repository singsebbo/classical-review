import { Request, Response, NextFunction } from "express";

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
     * @todo Insert the review into the reviews database under the user
     * @todo Send back the response
     */
  } catch (error: unknown) {
    next(error);
  }
}
