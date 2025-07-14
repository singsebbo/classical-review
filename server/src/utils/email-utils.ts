import nodemailer, { Transporter } from "nodemailer";
import {
  ORACLE_SMTP_USER,
  ORACLE_SMTP_PASSWORD,
  EMAIL_SENDER,
  WEBSITE_URL,
} from "../config";
import EmailError from "../errors/email-error";

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
    const transporter: Transporter = nodemailer.createTransport({
      host: "smtp.email.us-sanjose-1.oci.oraclecloud.com",
      port: 587,
      secure: false,
      auth: {
        user: ORACLE_SMTP_USER,
        pass: ORACLE_SMTP_PASSWORD,
      },
    });
    const mailOptions = {
      from: EMAIL_SENDER,
      to: email,
      subject: "Verify your Classical Review Email",
      text: `Email verification: ${WEBSITE_URL}/verify-email?token=${verificationToken}`,
      html: `
        <p>Hello ${username},</p>
        <p>Please follow the link below to verify your email address for classical review.</p>
        <a href="${WEBSITE_URL}/verify-email?token=${verificationToken}">Verification</a>
      `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error: unknown) {
    throw new EmailError(
      "Error while sending email verification",
      "Verification",
      email
    );
  }
}
