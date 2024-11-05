import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user-model";
import { User } from "../interfaces/entities";
import { RegistrationData } from "../interfaces/request-interfaces";
import { hashPassword } from "../utils/password-utils";
import {
  createEmailVerificationToken,
  getUserIdFromToken,
} from "../utils/token-utils";
import { sendVerificationEmail } from "../utils/email-utils";

/**
 * Registers a new user.
 * @param {Request} req - The request object containing user details.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves to void.
 * @remarks
 * Expects request to already be validated.
 */
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, email, password }: RegistrationData = req.body;
    const passwordHash: string = await hashPassword(password);
    const user: User = await UserModel.createUser(
      username,
      email,
      passwordHash
    );
    const verificationToken: string = createEmailVerificationToken(
      user.user_id
    );
    await sendVerificationEmail(username, email, verificationToken);
    res.status(201).json({
      success: true,
      message: "User has been successfully registered",
    });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Verifies a user.
 * @param {Request} req - The request object containing the token.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns A promise that resolves to void.
 * @remarks
 * Expects request to already be validated.
 */
export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.body;
    const userId: string = getUserIdFromToken(token);
    await UserModel.setUserVerified(userId);
    res.status(200).json({
      success: true,
      message: "User has been successfully verified",
    });
  } catch (error: unknown) {
    next(error);
  }
}
