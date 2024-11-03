import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";
import ValidatorError, {
  ValidationErrorDetail,
} from "../errors/validator-error";

/**
 * Creates a validation error with a specific message.
 * @param {Request} req - Express request.
 * @param {NextFunction} next - Express response.
 * @param message Describes the overall validation error.
 */
function createValidationError(
  req: Request,
  next: NextFunction,
  message: string
): void {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    const processedValidationErrors: ValidatorError = new ValidatorError(
      message,
      validationErrors.array().map(
        (validationErrors: ValidationError): ValidationErrorDetail => ({
          type: validationErrors.type,
          message: validationErrors.msg,
        })
      )
    );
    next(processedValidationErrors);
  }
  next();
}

export function registerUserValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  createValidationError(
    req,
    next,
    "Validation error(s) encountered while registering user"
  );
}
