import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user-model";
import { User } from "../interfaces/entities";
import { RegistrationData } from "../interfaces/request-interfaces";
import { hashPassword } from "../utils/password-utils";

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
    const { username, email, password }: RegistrationData = req.body;
    const passwordHash: string = await hashPassword(password);
    const user: User = await UserModel.createUser(
      username,
      email,
      passwordHash
    );
    // Send JWT email
    res.status(201).json({
      success: true,
      message: "User has been successfully registered",
    });
  } catch (error: unknown) {
    next(error);
  }
}
