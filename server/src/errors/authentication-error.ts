/** Represents an error with user authentication */
class AuthenticationError extends Error {
  public readonly name: string;
  public readonly statusCode: number;

  /**
   * Creates an user authentication error.
   * @param {string} message - Error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }
}

export default AuthenticationError;
