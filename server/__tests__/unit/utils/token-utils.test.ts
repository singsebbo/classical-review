import {
  createAccessToken,
  createEmailVerificationToken,
  createRefreshToken,
  getUserIdFromBearer,
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

test("should successfully create a refresh token", (): void => {
  const userId = "asdfafjhad234q";
  const token: string = createRefreshToken(userId);
  expect(token).not.toBe(userId);
});

test("should successfully create an access token", (): void => {
  const userId = "asdfafjhad234q";
  const token: string = createAccessToken(userId);
  expect(token).not.toBe(userId);
});

test("should successfully get the userId from the authorization header", (): void => {
  const userId = "1234userId";
  const token: string = createAccessToken(userId);
  const header: string = `Bearer ${token}`;
  expect(getUserIdFromBearer(header)).toBe(userId);
});
