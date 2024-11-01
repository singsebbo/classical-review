import { Request, Response, NextFunction } from "express";

/**
 * Registers a new user.
 * @param {Request} req - The request object containing user details.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 */
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(201).json({ message: "User has successfully registered" });
  } catch (error: unknown) {
    next(error);
  }
}
