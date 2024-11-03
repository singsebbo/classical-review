import { Request, Response, NextFunction } from "express";
import ModelError from "../errors/model-error";
import ValidatorError, {
  ValidationErrorDetail,
} from "../errors/validator-error";
import EmailError from "../errors/email-error";

interface ErrorResponse {
  success: boolean;
  message: string;
  context?: any;
}

/**
 * Custom error handling middleware for various errors that might be encountered.
 * @param {Error} error - The error(s) encountered.
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
  // Handle validation errors
  if (error instanceof ValidatorError) {
    console.error(`${error.message}:\n`, error.stack);
    error.details.forEach((validationError: ValidationErrorDetail): void =>
      console.error("Validation error:\n", validationError)
    );
    res.status(error.statusCode).json({
      success: false,
      message: error.details,
    });
  }

  // Handle database model errors
  if (error instanceof ModelError) {
    console.error("A database model error has occurred:\n", error.stack);
    console.error("Error details:\n", error);
    const errorResponse: ErrorResponse = {
      success: false,
      message: error.message,
    };
    res.status(error.statusCode || 500).json(errorResponse);
  }

  // Handle email errors
  if (error instanceof EmailError) {
    console.error(`${error.message}:\n`, error.stack);
    console.error("Error details:\n", error);
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  // Handle generic errors
  if (error instanceof Error) {
    console.error("An unexpected error has occurred:\n", error.stack);
    console.error("Error details:\n", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occured",
    });
  }
}

export default errorHandler;
