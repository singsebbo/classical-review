import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import * as accountController from "../../../src/controllers/account-controller";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../src/config";

let consoleErrorSpy: jest.SpyInstance;

jest.mock("../../../src/models/user-model");

beforeEach((): void => {
  consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation((): void => {});
});

afterEach((): void => {
  consoleErrorSpy.mockRestore();
});

afterAll((): void => {
  jest.clearAllMocks();
});

describe("PUT /api/account/verify-email tests", (): void => {
  describe("Validation error tests", (): void => {
    test("should output validation errors to console and not call verifyUser", async (): Promise<void> => {
      jest.spyOn(accountController, "verifyUser").mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).put(
        "/api/account/verify-email"
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while verifying user:\n",
        expect.any(String)
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Validation error:\n",
        {
          type: "field",
          message: "Verification token must exist.",
        }
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(accountController.verifyUser).not.toHaveBeenCalled();
    });
    describe("invalid verification token tests", (): void => {
      test("should fail with a non-existent token", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).put(
          "/api/account/verify-email"
        );
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Verification token must exist.",
          },
        ]);
      });
      test("should fail with a non-string token", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .put("/api/account/verify-email")
          .send({ token: 123 });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Verification token must be a string.",
          },
        ]);
      });
      test("should fail with a string that is not a jwt", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .put("/api/account/verify-email")
          .send({
            token: "myrandomtoken.asdfjoiajfo234982380asdfajfij",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Token is not a JWT.",
          },
        ]);
      });
      test("should fail with a token signed improperly", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .put("/api/account/verify-email")
          .send({
            token: jwt.sign(
              { userId: "askjdfa9p83rupi", purpose: "email_verification" },
              "aksjfahp23498"
            ),
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "invalid signature",
          },
        ]);
      });
      test("should fail with a token not meant for email verification", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .put("/api/account/verify-email")
          .send({
            token: jwt.sign(
              { userId: "aUserId123456", purpose: "not_email_verification" },
              JWT_SECRET
            ),
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Token is not for the purpose of email verification.",
          },
        ]);
      });
    });
  });
});
