import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import { RegistrationData } from "../../../src/interfaces/request-interfaces";
import UserModel from "../../../src/models/user-model";
import * as accountController from "../../../src/controllers/account-controller";
import ModelError from "../../../src/errors/model-error";
import EmailError from "../../../src/errors/email-error";
import { sendVerificationEmail } from "../../../src/utils/email-utils";

let consoleErrorSpy: jest.SpyInstance;

jest.mock("../../../src/models/user-model");
jest.mock("../../../src/utils/email-utils");

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

describe("POST /api/account/register tests", (): void => {
  const validDetails: RegistrationData = {
    username: "gooduser",
    email: "gooduser12@domain.com",
    password: "str0ngPassword!",
  };
  describe("Validation error tests", (): void => {
    test("should output validation errors to console and not call registerUser", async (): Promise<void> => {
      const registerUserSpy: jest.SpyInstance = jest
        .spyOn(accountController, "registerUser")
        .mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).post(
        "/api/account/register"
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while registering user:\n",
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
          message: "Email field must exist.",
        }
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        4,
        "Validation error:\n",
        {
          type: "field",
          message: "Password field must exist.",
        }
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
      expect(accountController.registerUser).not.toHaveBeenCalled();
      registerUserSpy.mockClear();
    });
    describe("Invalid username tests", (): void => {
      // Mocks email uniqueness
      let emailUnique: jest.Mock;
      beforeAll((): void => {
        emailUnique = (UserModel.isEmailUnique as jest.Mock).mockResolvedValue(
          true
        );
      });
      afterAll((): void => {
        emailUnique.mockClear();
      });
      test("should fail with a non-existent username", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username field must exist.",
          },
        ]);
      });
      test("should fail with a non-string username", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: 123,
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username must be a string.",
          },
        ]);
      });
      test("should fail with a username that is too short", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: "a",
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username must be between 2 and 32 characters long.",
          },
        ]);
      });
      test("should fail with a username that is too long", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: "qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm",
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username must be between 2 and 32 characters long.",
          },
        ]);
      });
      test("should fail with a username that is not alphanumeric", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: "a2%",
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              'Username must follow "en-US" language code and can not contain symbols.',
          },
        ]);
      });
      test("should fail with a username that does not follow en-US language code", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: "ñef",
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              'Username must follow "en-US" language code and can not contain symbols.',
          },
        ]);
      });
      test("should fail with a username that contains profanity", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: "fuck",
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username must not contain profanity.",
          },
        ]);
      });
      test("should fail with a username that is not unique", async (): Promise<void> => {
        const usernameUnique: jest.Mock = (
          UserModel.isUsernameUnique as jest.Mock
        ).mockResolvedValue(false);
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: "usernameExists",
            email: validDetails.email,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Username is already in use.",
          },
        ]);
        usernameUnique.mockClear();
      });
    });
    describe("Invalid email tests", (): void => {
      // Mock username uniqueness
      let usernameUnique: jest.Mock;
      beforeAll((): void => {
        usernameUnique = (
          UserModel.isUsernameUnique as jest.Mock
        ).mockResolvedValue(true);
      });
      afterAll((): void => {
        usernameUnique.mockClear();
      });
      test("should fail with a non-existent email", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Email field must exist.",
          },
        ]);
      });
      test("should fail with a non-string email", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: 123,
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Email must be a string.",
          },
        ]);
      });
      test("should fail with a string not in email format", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: "bademail@bademail",
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Email address must be in standard format.",
          },
        ]);
      });
      test("should fail with an email that is not unique", async (): Promise<void> => {
        const emailUnique: jest.Mock = (
          UserModel.isEmailUnique as jest.Mock
        ).mockResolvedValue(false);
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: "notuniqueemail@somedomain.com",
            password: validDetails.password,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Email is already in use.",
          },
        ]);
        emailUnique.mockClear();
      });
    });
    describe("Invalid password tests", (): void => {
      // Mock username and email uniqueness
      let usernameUnique: jest.Mock;
      let emailUnique: jest.Mock;
      beforeAll((): void => {
        usernameUnique = (
          UserModel.isUsernameUnique as jest.Mock
        ).mockResolvedValue(true);
        emailUnique = (UserModel.isEmailUnique as jest.Mock).mockResolvedValue(
          true
        );
      });
      afterAll((): void => {
        usernameUnique.mockClear();
        emailUnique.mockClear;
      });
      test("should fail with a non-existent password", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Password field must exist.",
          },
        ]);
      });
      test("should fail with a non-string password", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: 123,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Password must be a string.",
          },
        ]);
      });
      test("should fail with a password that is too short", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: "aD1#",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Password must be between 8-64 characters.",
          },
        ]);
      });
      test("should fail with a password that is too long", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password:
              "abcdefghijklmnopqrstuvwxyz1234abcdefghijklmnopqrstuvwxyz!@#$ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Password must be between 8-64 characters.",
          },
        ]);
      });
      test("should fail with a password that is not alphanumeric", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: "BadCharacters1!:()_+",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              'Password must be alphanumeric following "en-US" language code exluding the characters "!@#$%^&*".',
          },
        ]);
      });
      test("should fail with a password that is not in en-US language code", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: "ańyoC0rp!",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              'Password must be alphanumeric following "en-US" language code exluding the characters "!@#$%^&*".',
          },
        ]);
      });
      test("should fail with a password does not contain lowercase", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: "NOLOWERCASE12!",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              "Password must contain at least one lowercase, one uppercase, and one number.",
          },
        ]);
      });
      test("should fail with a password does not contain uppercase", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: "nouppercasecase12!",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              "Password must contain at least one lowercase, one uppercase, and one number.",
          },
        ]);
      });
      test("should fail with a password with no numbers", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: "NoNumbers!",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              "Password must contain at least one lowercase, one uppercase, and one number.",
          },
        ]);
      });
      test("should fail with a password with no symbols", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            username: validDetails.username,
            email: validDetails.email,
            password: "NoSymb0ls",
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message:
              "Password must contain at least one lowercase, one uppercase, and one number.",
          },
        ]);
      });
    });
  });
  describe("Controller error tests", (): void => {
    test("should handle an error if UserModel fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError(
        "Failed creating a user",
        500,
        "context"
      );
      mockError.stack = "Error stack trace";
      const mockCreateUser: jest.Mock = (
        UserModel.createUser as jest.Mock
      ).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .post("/api/account/register")
        .send({
          username: validDetails.username,
          email: validDetails.email,
          password: validDetails.password,
        });
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "A database model error has occurred:\n",
        mockError.stack
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Error details:\n",
        mockError
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
      mockCreateUser.mockClear();
    });
    test("should handle an error if email service fails", async (): Promise<void> => {
      const emailError: EmailError = new EmailError(
        "Email error",
        "Verification",
        validDetails.email
      );
      emailError.stack = "Error stack trace";
      const mockUser: jest.Mock = (
        UserModel.createUser as jest.Mock
      ).mockResolvedValue({ user_id: "123asdaer343" });
      const mockEmail: jest.Mock = (
        sendVerificationEmail as jest.Mock
      ).mockRejectedValue(emailError);
      const response: SupertestResponse = await request(app)
        .post("/api/account/register")
        .send({
          username: validDetails.username,
          email: validDetails.email,
          password: validDetails.password,
        });
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        `${emailError.message}:\n`,
        emailError.stack
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Error details:\n",
        emailError
      );
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", emailError.message);
      mockUser.mockClear();
      mockEmail.mockClear();
    });
  });
  test("should successfully create a new user", async (): Promise<void> => {
    const mockUser: jest.Mock = (
      UserModel.createUser as jest.Mock
    ).mockResolvedValue({ user_id: "123asdaer343" });
    const mockEmail: jest.Mock = (
      sendVerificationEmail as jest.Mock
    ).mockResolvedValue(undefined);
    const response: SupertestResponse = await request(app)
      .post("/api/account/register")
      .send({
        username: validDetails.username,
        email: validDetails.email,
        password: validDetails.password,
      });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "User has been successfully registered"
    );
    mockUser.mockClear();
    mockEmail.mockClear();
  });
});
