import { hashPassword } from "../../../src/utils/password-utils";

test("should successfully hash a password", async (): Promise<void> => {
  const password = "Password123!";
  const hashedPassword: string = await hashPassword(password);
  expect(hashedPassword).not.toBe(password);
});
