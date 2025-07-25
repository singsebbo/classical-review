import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user-model";
import { LikedReview, Review, User } from "../interfaces/entities";
import { LoginData, RegistrationData } from "../interfaces/request-interfaces";
import { hashPassword } from "../utils/password-utils";
import {
  createAccessToken,
  createEmailVerificationToken,
  createRefreshToken,
  getUserIdFromBearer,
  getUserIdFromToken,
} from "../utils/token-utils";
import { sendVerificationEmail } from "../utils/email-utils";
import TokenModel from "../models/token-model";
import { NODE_ENV } from "../config";
import ReviewModel from "../models/review-model";
import LikedReviewsModel from "../models/liked-reviews-model";

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

/**
 * Logins the user.
 * @param {Request} req - The request object containing username and password.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns A promise that resolves to void.
 */
export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username }: LoginData = req.body;
    const userId: string = await UserModel.getUserId({ username: username });
    const refreshToken: string = createRefreshToken(userId);
    const accessToken: string = createAccessToken(userId);
    await TokenModel.insertToken(userId, refreshToken);
    res
      .status(201)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "strict" : "none",
        maxAge: 180 * 24 * 60 * 60 * 1000,
      })
      .send({
        success: true,
        accessToken: accessToken,
      });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Logs out the user.
 * @param {Request} req - The request object containing the bearer token.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns A promise that resolves to void.
 */
export async function logoutUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken: string = req.cookies.refreshToken;
    const userId: string = getUserIdFromToken(refreshToken);
    try {
      await TokenModel.removeExistingTokens(userId);
    } catch (error: unknown) {
      console.error("Failed to remove refresh tokens from database", error);
    }
    res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "strict" : "none",
      })
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Refreshes the user's tokens.
 * @param {Request} req - The request object containing the bearer token.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns A promise that resolves to void.
 */
export async function refreshTokens(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken: string = req.cookies.refreshToken;
    const userId: string = getUserIdFromToken(refreshToken);
    await TokenModel.removeExistingTokens(userId);
    const newRefreshToken: string = createRefreshToken(userId);
    await TokenModel.insertToken(userId, newRefreshToken);
    const newAccessToken: string = createAccessToken(userId);
    res
      .status(200)
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: NODE_ENV === "production" ? "strict" : "none",
        maxAge: 180 * 24 * 60 * 60 * 1000,
      })
      .send({
        success: true,
        accessToken: newAccessToken,
      });
  } catch (error: unknown) {
    next(error);
  }
}

/**
 * Gets the user's info.
 * @param {Request} req - The request object containing the bearer token.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 * @returns A promise that resolves to void.
 */
export async function getInfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId: string = getUserIdFromBearer(
      req.headers.authorization as string
    );
    const userDetails: Partial<User> = await UserModel.getUserDetails(userId);
    const userReviews: Review[] = await ReviewModel.getUserReviews(userId);
    const likedReviews: LikedReview[] = await LikedReviewsModel.getLikedReviews(
      userId
    );
    res.status(200).json({
      success: true,
      message: "Successfully retrieved user information.",
      userDetails,
      userReviews,
      likedReviews,
    });
  } catch (error: unknown) {
    next(error);
  }
}
