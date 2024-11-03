/** Represents an error about sending emails. */
class EmailError extends Error {
  public readonly type: "Verification";
  public readonly statusCode: number;
  public readonly recipient: string;

  /**
   * Creates a new email error.
   * @param {string} message - Error message.
   * @param {"Verification"} type - The type of email error.
   * @param {string} recipient - The intended recipient of the email.
   */
  constructor(message: string, type: "Verification", recipient: string) {
    super(message);
    this.type = type;
    this.statusCode = 500;
    this.recipient = recipient;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EmailError);
    }
  }
}

export default EmailError;
