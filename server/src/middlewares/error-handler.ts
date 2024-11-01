import { Request, Response, NextFunction } from "express";

/**
 *
 * @param {Error} error - The error encountered.
 * @param {Request} req - The request object sent.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 */
function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle generic errors
  if (error instanceof Error) {
    console.error(error.stack);
    res.status(500).json({
      success: false,
      message: "An unexpected error occured",
    });
  }
}

export default errorHandler;
