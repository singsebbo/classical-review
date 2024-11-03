import sgMail from "@sendgrid/mail";
import {
  SENDGRID_API_KEY,
  SENDGRID_EMAIL_SENDER,
  WEBSITE_URL,
} from "../config";
import EmailError from "../errors/email-error";

sgMail.setApiKey(SENDGRID_API_KEY);

/**
 * Send a verification email a user.
 * @param {string} username - Username of the user to send it to.
 * @param {string} email - The recipient's email.
 * @param {string} verificationToken - Verification token containing user ID.
 * @returns A promise that resolves to void.
 * @throws An EmailError if unsuccessful.
 */
export async function sendVerificationEmail(
  username: string,
  email: string,
  verificationToken: string
): Promise<void> {
  try {
    const msg: sgMail.MailDataRequired = {
      to: email,
      from: SENDGRID_EMAIL_SENDER,
      subject: "Verify your email for classical review",
      text: `Email verification: ${WEBSITE_URL}/verify-email?token=${verificationToken}`,
      html: `
        <p>Hello ${username},</p>
        <p>Please follow the link below to verify your email address for music log.</p>
        <a href="${WEBSITE_URL}/verify-email?token=${verificationToken}">Verification</a>
      `,
    };
    await sgMail.send(msg);
  } catch (error: unknown) {
    throw new EmailError(
      "Error while sending email verification",
      "Verification",
      email
    );
  }
}
