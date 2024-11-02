/** Represents an error with the database model. */
class ModelError extends Error {
  public readonly name: string;
  public readonly statusCode?: number;
  public readonly context?: any;

  /**
   * Creates a database model error.
   * @param {string} message - Error message.
   * @param {number} statusCode - HTTP response status code.
   * @param context - Extra information pertaining to the error.
   */
  constructor(message: string, statusCode: number, context?: any) {
    super(message);
    this.name = "ModelError";
    this.statusCode = statusCode;
    this.context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ModelError);
    }
  }
}

export default ModelError;
