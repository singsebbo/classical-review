import nodemailer from "nodemailer";
import { sendVerificationEmail } from "../../../src/utils/email-utils";
import EmailError from "../../../src/errors/email-error";
import { EMAIL_SENDER } from "../../../src/config";

jest.mock("nodemailer");

const sendMailMock = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  (nodemailer.createTransport as jest.Mock).mockReturnValue({
    sendMail: sendMailMock,
  });
});

describe("sendVerificationEmail tests", (): void => {
  const mockUsername = "testuser";
  const mockEmail = "test@domain.com";
  const mockVerificationToken = "1234abcd";
  test("should successfully send verification email", async (): Promise<void> => {
    await sendVerificationEmail(mockUsername, mockEmail, mockVerificationToken);
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: mockEmail,
        from: EMAIL_SENDER,
        subject: expect.any(String),
        text: expect.any(String),
        html: expect.any(String),
      })
    );
  });
  test("should fail to send a verification email", async (): Promise<void> => {
    sendMailMock.mockRejectedValue(new Error("Send failed"));
    await expect(
      sendVerificationEmail(mockUsername, mockEmail, mockVerificationToken)
    ).rejects.toThrow(EmailError);
    await expect(
      sendVerificationEmail(mockUsername, mockEmail, mockVerificationToken)
    ).rejects.toThrow("Error while sending email verification");
  });
});
