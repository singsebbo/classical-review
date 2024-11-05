import {
  createEmailVerificationToken,
  getUserIdFromToken,
} from "../../../src/utils/token-utils";

test("should successfully create an email verification token", (): void => {
  const userId = "1234abcd";
  const token: string = createEmailVerificationToken(userId);
  expect(token).not.toBe(userId);
});

test("should successfully get the userId from a token", (): void => {
  const userId = "aasdkflja32p89rausp9fihwa98rsijfo";
  const token: string = createEmailVerificationToken(userId);
  expect(getUserIdFromToken(token)).toBe(userId);
});
