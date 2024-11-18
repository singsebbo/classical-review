import { Request, Response, NextFunction } from "express";
import { Composer } from "../interfaces/entities";
import ComposerModel from "../models/composer-model";

/**
 * Searches for composers given a search term.
 * @param {Request} req - The request object containing user details.
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
 * @param {Request} req - The request object containing user details.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function searchCompositions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  /**
   * @todo Get the search term from the query string
   * @todo Get the compositions given the query string
   * @todo Send the response
   */
}
