import request, { Response as SupertestResponse } from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../src/app";
import {
  createEmailVerificationToken,
  createRefreshToken,
} from "../../../src/utils/token-utils";
import TokenModel from "../../../src/models/token-model";
import ModelError from "../../../src/errors/model-error";
import { NODE_ENV } from "../../../src/config";

jest.mock("../../../src/models/token-model");

describe("POST /api/account/refresh-tokens", (): void => {
  const validRefreshToken: string = createRefreshToken("1");
  describe("Error tests", (): void => {
    let consoleErrorSpy: jest.SpyInstance;
    beforeEach((): void => {
      consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(jest.fn());
    });
    afterAll((): void => {
      consoleErrorSpy.mockRestore();
    });
    describe("Validation error tests", (): void => {
      test("should output validation errors to console", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).post(
          "/api/account/refresh-tokens"
        );
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(
          1,
          "Validation error(s) encountered while refreshing tokens:\n",
          expect.any(String)
        );
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(
          2,
          "Validation error:\n",
          {
            type: "field",
            message: "Refresh token is missing.",
          }
        );
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [{ type: "field", message: "Refresh token is missing." }],
        });
      });
      describe("Cookie errors", (): void => {
        test("Should fail when missing refresh token", async (): Promise<void> => {
          const response: SupertestResponse = await request(app).post(
            "/api/account/refresh-tokens"
          );
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toEqual({
            success: false,
            message: [{ type: "field", message: "Refresh token is missing." }],
          });
        });
        test("Should fail when given refresh token is not a JWT", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .post("/api/account/refresh-tokens")
            .set("Cookie", ["refreshToken=asjfasfjqpfjsdkfjasofji"]);
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toEqual({
            success: false,
            message: [{ type: "field", message: "Refresh token is invalid." }],
          });
        });
        test("Should fail when given refresh token is signed improperly", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .post("/api/account/refresh-tokens")
            .set("Cookie", [
              `refreshToken=${jwt.sign(
                { userId: "1", purpose: "refresh" },
                "badKey"
              )}`,
            ]);
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toEqual({
            success: false,
            message: [{ type: "field", message: "invalid signature" }],
          });
        });
        test("Should fail when given refresh token is not for refresh", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .post("/api/account/refresh-tokens")
            .set("Cookie", [
              `refreshToken=${createEmailVerificationToken("1")}`,
            ]);
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toEqual({
            success: false,
            message: [
              { type: "field", message: "Token is not a refresh token." },
            ],
          });
        });
      });
    });
    describe("Controller error tests", (): void => {
      test("removeExistingTokens fails", async (): Promise<void> => {
        const mockError: ModelError = new ModelError(
          "Database connection failed",
          500
        );
        (TokenModel.removeExistingTokens as jest.Mock).mockRejectedValue(
          mockError
        );
        const response: SupertestResponse = await request(app)
          .post("/api/account/refresh-tokens")
          .set("Cookie", [`refreshToken=${validRefreshToken}`]);
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
      test("insertToken fails", async (): Promise<void> => {
        (TokenModel.removeExistingTokens as jest.Mock).mockResolvedValue(
          undefined
        );
        const mockError: ModelError = new ModelError(
          "Database connection failed",
          500
        );
        (TokenModel.insertToken as jest.Mock).mockRejectedValue(mockError);
        const response: SupertestResponse = await request(app)
          .post("/api/account/refresh-tokens")
          .set("Cookie", [`refreshToken=${validRefreshToken}`]);
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
    });
  });
  test("should successfully refresh tokens", async (): Promise<void> => {
    (TokenModel.removeExistingTokens as jest.Mock).mockResolvedValue(undefined);
    (TokenModel.insertToken as jest.Mock).mockResolvedValue(undefined);
    const response: SupertestResponse = await request(app)
      .post("/api/account/refresh-tokens")
      .set("Cookie", [`refreshToken=${validRefreshToken}`]);
    const cookies = response.headers["set-cookie"];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    const refreshTokenCookie = cookieArray.find((cookie: string): boolean =>
      cookie.startsWith("refreshToken=")
    );
    expect(response.statusCode).toBe(200);
    expect(cookies).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain("HttpOnly");
    expect(refreshTokenCookie).toContain("SameSite=Strict");
    expect(refreshTokenCookie).not.toBe(validRefreshToken);
    if (NODE_ENV === "production") {
      expect(refreshTokenCookie).toContain("Secure");
    }
    const maxAgeMatch = /max-age=(\d+)/i.exec(refreshTokenCookie);
    expect(maxAgeMatch).not.toBeNull();
    const maxAgeSeconds = parseInt(maxAgeMatch![1], 10);
    const expectedMaxAge = 180 * 24 * 60 * 60;
    expect(maxAgeSeconds).toBe(expectedMaxAge);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("accessToken");
  });
});
