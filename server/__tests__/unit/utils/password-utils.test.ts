import {
  hashPassword,
  isValidPassword,
} from "../../../src/utils/password-utils";

test("should successfully hash a password", async (): Promise<void> => {
  const password = "Password123!";
  const hashedPassword: string = await hashPassword(password);
  expect(hashedPassword).not.toBe(password);
});

test("should successfully validate password", async (): Promise<void> => {
  const password = "unhashedPassword99!";
  const hashedPassword: string = await hashPassword(password);
  expect(isValidPassword(password, hashedPassword)).resolves.toBe(true);
});
