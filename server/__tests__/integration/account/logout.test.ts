import request, { Response as SupertestResponse } from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../src/app";
import {
  createEmailVerificationToken,
  createRefreshToken,
} from "../../../src/utils/token-utils";
import TokenModel from "../../../src/models/token-model";
import ModelError from "../../../src/errors/model-error";

jest.mock("../../../src/models/token-model");

describe("POST /api/account/logout", (): void => {
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
          "/api/account/logout"
        );
        expect(consoleErrorSpy).toHaveBeenNthCalledWith(
          1,
          "Validation error(s) encountered while logging out user:\n",
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
            "/api/account/logout"
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
            .post("/api/account/logout")
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
            .post("/api/account/logout")
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
            .post("/api/account/logout")
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
      const validRefreshToken: string = createRefreshToken("1");
      test("removeExistingTokens fails", async (): Promise<void> => {
        const mockError: ModelError = new ModelError(
          "Database connection failed",
          400
        );
        (TokenModel.removeExistingTokens as jest.Mock).mockRejectedValue(
          mockError
        );
        const response: SupertestResponse = await request(app)
          .post("/api/account/logout")
          .set("Cookie", [`refreshToken=${validRefreshToken}`]);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to remove refresh tokens from database",
          mockError
        );
        expect(response.statusCode).toBe(200);
        expect(response.headers["set-cookie"]).toEqual([
          expect.stringContaining("refreshToken=;"),
        ]);
        expect(response.body).toEqual({
          success: true,
          message: "Logged out successfully",
        });
      });
    });
  });
});
