import { Request, Response, NextFunction } from "express";
import { ValidationError } from "express-validator";
import ModelError from "../errors/model-error";

interface ValidationErrorMessage {
  type: ValidationError["type"];
  message: string;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  context?: any;
}

/**
 * Custom error handling middleware for various errors that might be encountered.
 * @param {Error | ValidationError[]} error - The error(s) encountered.
 * @param {Request} req - The request object sent.
 * @param {Response} res - The response object to send back.
 * @param {NextFunction} next - The next middleware function.
 */
function errorHandler(
  error: Error | ValidationError[],
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Handle validation errors
  if (Array.isArray(error)) {
    // Prints each validation error out to the console
    error.forEach((validationError: ValidationError): void =>
      console.error("A validation error has occurred:\n", validationError)
    );
    // Creates an easier to read array of validation errors
    const errorMessages: ValidationErrorMessage[] = error.map(
      (validationError: ValidationError): ValidationErrorMessage => ({
        type: validationError.type,
        message: validationError.msg,
      })
    );
    res.status(400).json({
      success: false,
      message: errorMessages,
    });
  }

  // Handle database model errors
  if (error instanceof ModelError) {
    console.error("A database model error has occurred:\n", error.stack);
    const errorResponse: ErrorResponse = {
      success: false,
      message: error.message,
    };
    if (error.context) {
      errorResponse.context = error.context;
    }
    res.status(error.statusCode || 500).json(errorResponse);
  }

  // Handle generic errors
  if (error instanceof Error) {
    console.error("An unexpected error has occurred:\n", error.stack);
    res.status(500).json({
      success: false,
      message: "An unexpected error occured",
    });
  }
}

export default errorHandler;
