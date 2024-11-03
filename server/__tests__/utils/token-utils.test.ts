import { createEmailVerificationToken } from "../../src/utils/token-utils";

test("should successfully create an email verification token", (): void => {
  const userId = "1234abcd";
  const token: string = createEmailVerificationToken(userId);
  expect(token).not.toBe(userId);
});
