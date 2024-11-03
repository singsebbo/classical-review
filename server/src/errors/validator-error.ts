/** Represents the details pertaining to one specific validation error. */
export interface ValidationErrorDetail {
  type: string;
  message: string;
}

/** Represents an error with validation. */
class ValidatorError extends Error {
  public readonly name: string;
  public readonly statusCode: number;
  public readonly details: ValidationErrorDetail[];

  /**
   * Creates a validation error.
   * @param {string} message - Error message.
   * @param {ValidationErrorDetail[]} details - Specific information about the validation error(s).
   */
  constructor(message: string, details: ValidationErrorDetail[]) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidatorError);
    }
  }
}

export default ValidatorError;
