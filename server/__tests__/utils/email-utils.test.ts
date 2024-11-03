import sgMail from "@sendgrid/mail";
import { sendVerificationEmail } from "../../src/utils/email-utils";
import EmailError from "../../src/errors/email-error";
import { WEBSITE_URL, SENDGRID_EMAIL_SENDER } from "../../src/config";

jest.mock("@sendgrid/mail");

beforeEach((): void => {
  jest.clearAllMocks();
});

describe("sendVerificationEmail tests", (): void => {
  const mockUsername = "testuser";
  const mockEmail = "test@domain.com";
  const mockVerificationToken = "1234abcd";
  test("should successfully send verification email", async (): Promise<void> => {
    await sendVerificationEmail(mockUsername, mockEmail, mockVerificationToken);
    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockEmail,
        from: SENDGRID_EMAIL_SENDER,
        subject: expect.any(String),
        text: expect.any(String),
        html: expect.any(String),
      })
    );
  });
  test("should fail to send a verification email", async (): Promise<void> => {
    (sgMail.send as jest.Mock).mockRejectedValue(new Error("Send failed"));
    await expect(
      sendVerificationEmail(mockUsername, mockEmail, mockVerificationToken)
    ).rejects.toThrow(EmailError);
    await expect(
      sendVerificationEmail(mockUsername, mockEmail, mockVerificationToken)
    ).rejects.toThrow("Error while sending email verification");
  });
});
