import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import * as accountController from "../../../src/controllers/account-controller";
import * as passwordUtils from "../../../src/utils/password-utils";
import UserModel from "../../../src/models/user-model";
import ModelError from "../../../src/errors/model-error";
import { isValidPassword } from "../../../src/utils/password-utils";
import TokenModel from "../../../src/models/token-model";
import { NODE_ENV } from "../../../src/config";

let consoleErrorSpy: jest.SpyInstance;

beforeEach((): void => {
  consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation((): void => {});
});

afterEach((): void => {
  jest.restoreAllMocks();
  consoleErrorSpy.mockRestore();
});

describe("POST /api/account/sessions", (): void => {
  describe("Validation errors", (): void => {
    test("should output validation errors to console and not call loginUser", async (): Promise<void> => {
      const loginUserSpy: jest.SpyInstance = jest
        .spyOn(accountController, "loginUser")
        .mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).post(
        "/api/account/sessions"
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while logging in user:\n",
        expect.any(String)
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Validation error:\n",
        {
          type: "field",
          message: "Username field must exist.",
        }
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        3,
        "Validation error:\n",
        {
          type: "field",
          message: "Password field must exist.",
        }
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", [
        {
          type: "field",
          message: "Username field must exist.",
        },
        {
          type: "field",
          message: "Password field must exist.",
        },
      ]);
      expect(loginUserSpy).not.toHaveBeenCalled();
      loginUserSpy.mockRestore();
    });
    describe("Username errors", (): void => {
      test("username does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/sessions")
          .send({
            password: "thisIsRandom123!",
          });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username field must exist.",
          },
        ]);
      });
      test("username is not a string", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/sessions")
          .send({
            username: 1234,
            password: "thisIsRandom123!",
          });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username must be a string.",
          },
        ]);
      });
      test("username does not exist", async (): Promise<void> => {
        jest
          .spyOn(UserModel, "userExistsAndIsVerified")
          .mockImplementation(jest.fn());
        (UserModel.userExistsAndIsVerified as jest.Mock).mockRejectedValue(
          new ModelError("User does not exist.", 400)
        );
        const response: SupertestResponse = await request(app)
          .post("/api/account/sessions")
          .send({
            username: "thisUserDoesNotExist",
            password: "thisIsRandom123!",
          });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "User does not exist.",
          },
        ]);
      });
    });
    describe("Password errors", (): void => {
      beforeEach((): void => {
        jest
          .spyOn(UserModel, "userExistsAndIsVerified")
          .mockImplementation(jest.fn());
        (UserModel.userExistsAndIsVerified as jest.Mock).mockResolvedValue(
          undefined
        );
      });
      test("password does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/sessions")
          .send({
            username: "aUsername",
          });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Password field must exist.",
          },
        ]);
      });
      test("password must be a string", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/sessions")
          .send({
            username: "aUsername",
            password: 1234,
          });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Password must be a string.",
          },
        ]);
      });
      test("password does not match", async (): Promise<void> => {
        jest.spyOn(UserModel, "getPasswordHash").mockImplementation(jest.fn());
        (UserModel.getPasswordHash as jest.Mock).mockResolvedValue("");
        jest
          .spyOn(passwordUtils, "isValidPassword")
          .mockImplementation(jest.fn());
        (isValidPassword as jest.Mock).mockResolvedValue(false);
        const response: SupertestResponse = await request(app)
          .post("/api/account/sessions")
          .send({
            username: "aUsername",
            password: "thisPassword",
          });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Incorrect password.",
          },
        ]);
      });
    });
  });
  describe("Controller errors", (): void => {
    beforeEach((): void => {
      jest
        .spyOn(UserModel, "userExistsAndIsVerified")
        .mockImplementation(jest.fn());
      (UserModel.userExistsAndIsVerified as jest.Mock).mockResolvedValue(
        undefined
      );
      jest.spyOn(UserModel, "getPasswordHash").mockImplementation(jest.fn());
      (UserModel.getPasswordHash as jest.Mock).mockResolvedValue("");
      jest
        .spyOn(passwordUtils, "isValidPassword")
        .mockImplementation(jest.fn());
      (isValidPassword as jest.Mock).mockResolvedValue(true);
      jest.spyOn(UserModel, "getUserId").mockImplementation(jest.fn());
      jest.spyOn(TokenModel, "insertToken").mockImplementation(jest.fn());
    });
    test("getUserId error", async (): Promise<void> => {
      const mockError: ModelError = new ModelError("getUserId error", 500);
      (UserModel.getUserId as jest.Mock).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .post("/api/account/sessions")
        .send({
          username: "username",
          password: "password",
        });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
    test("insertToken error", async (): Promise<void> => {
      (UserModel.getUserId as jest.Mock).mockResolvedValue("userId");
      const mockError: ModelError = new ModelError("insertToken error", 500);
      (TokenModel.insertToken as jest.Mock).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .post("/api/account/sessions")
        .send({
          username: "username",
          password: "password",
        });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
  });
  test("should test successfull request", async (): Promise<void> => {
    jest
      .spyOn(UserModel, "userExistsAndIsVerified")
      .mockImplementation(jest.fn());
    (UserModel.userExistsAndIsVerified as jest.Mock).mockResolvedValue(
      undefined
    );
    jest.spyOn(UserModel, "getPasswordHash").mockImplementation(jest.fn());
    (UserModel.getPasswordHash as jest.Mock).mockResolvedValue("");
    jest.spyOn(passwordUtils, "isValidPassword").mockImplementation(jest.fn());
    (isValidPassword as jest.Mock).mockResolvedValue(true);
    jest.spyOn(UserModel, "getUserId").mockImplementation(jest.fn());
    (UserModel.getUserId as jest.Mock).mockResolvedValue("userId1");
    jest.spyOn(TokenModel, "insertToken").mockImplementation(jest.fn());
    (TokenModel.insertToken as jest.Mock).mockResolvedValue(undefined);
    const response: SupertestResponse = await request(app)
      .post("/api/account/sessions")
      .send({
        username: "username1",
        password: "thisIsAPassword123!",
      });
    const cookies = response.headers["set-cookie"];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    const refreshTokenCookie = cookieArray.find((cookie: string): boolean =>
      cookie.startsWith("refreshToken=")
    );
    expect(response.statusCode).toBe(201);
    expect(cookies).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain("HttpOnly");
    if (NODE_ENV === "production") {
      expect(refreshTokenCookie).toContain("SameSite=Strict");
    }
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
