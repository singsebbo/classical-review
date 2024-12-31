import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import AuthenticationError from "../errors/authentication-error";

/**
 * Creates an authentication error with a specific message.
 * @param {Request} req - Express request.
 * @param {NextFunction} next - Express response.
 * @param message Describes the overall authentication error.
 */
function createAuthenticationError(
  req: Request,
  next: NextFunction,
  message: string
): void {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const authenticationError: AuthenticationError = new AuthenticationError(
      message
    );
    next(authenticationError);
  }
  next();
}

/** Handles authentication errors for POST /api/review/make-review */
export function makeReviewAuthenticationError(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  createAuthenticationError(
    req,
    next,
    "Authentication error encountered while making a review"
  );
}

/** Handles authentication errors for DELETE /api/review/delete-review */
export function deleteReviewAuthenticationError(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  createAuthenticationError(
    req,
    next,
    "Authentication error encountered while deleting a review"
  );
}

/** Handles authentication errors for PUT /api/review/change-review */
export function changeReviewAuthenticationError(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  createAuthenticationError(
    req,
    next,
    "Authentication error encountered while changing a review"
  );
}

/** Handles authentication errors for POST /api/review/like-review */
export function likeReviewAuthenticationError(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  createAuthenticationError(
    req,
    next,
    "Authentication error encountered while liking a review"
  );
}
