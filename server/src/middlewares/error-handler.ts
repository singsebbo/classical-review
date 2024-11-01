import { Request, Response, NextFunction } from "express";
import { ValidationError } from "express-validator";

interface ErrorMessage {
  type: ValidationError["type"];
  message: string;
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
  // Handle generic errors
  if (error instanceof Error) {
    console.error("An unexpected error has occurred:\n", error.stack);
    res.status(500).json({
      success: false,
      message: "An unexpected error occured",
    });
  }

  // Handle validation error(s)
  if (Array.isArray(error)) {
    // Prints each validation error out to the console
    error.forEach((validationError: ValidationError): void =>
      console.error(validationError)
    );
    // Creates an easier to read array of validation errors
    const errorMessages: ErrorMessage[] = error.map(
      (validationError: ValidationError): ErrorMessage => ({
        type: validationError.type,
        message: validationError.msg,
      })
    );
    res.status(400).json({
      success: false,
      message: errorMessages,
    });
  }
}

export default errorHandler;
