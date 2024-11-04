import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
import { RegistrationData } from "../../../src/interfaces/request-interfaces";
import UserModel from "../../../src/models/user-model";
import * as accountController from "../../../src/controllers/account-controller";

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

test("should output validation errors to console and not call registerUser", async (): Promise<void> => {
  jest.spyOn(accountController, "registerUser").mockImplementation(jest.fn());
  const response: SupertestResponse = await request(app).post(
    "/api/account/register"
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(
    1,
    "Validation error(s) encountered while registering user:\n",
    expect.any(String)
  );
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, "Validation error:\n", {
    type: "field",
    message: "Username field must exist.",
  });
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(3, "Validation error:\n", {
    type: "field",
    message: "Email field must exist.",
  });
  expect(consoleErrorSpy).toHaveBeenNthCalledWith(4, "Validation error:\n", {
    type: "field",
    message: "Password field must exist.",
  });
  expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
  expect(accountController.registerUser).not.toHaveBeenCalled();
});

describe("POST /api/account/register tests", (): void => {
  const validDetails: RegistrationData = {
    username: "gooduser",
    email: "gooduser12@domain.com",
    password: "str0ngPassword!",
  };
  describe("Validation error tests", (): void => {
    describe("Invalid username tests", (): void => {
      // Mocks email uniqueness
      (UserModel.isEmailUnique as jest.Mock).mockResolvedValue(true);
      test("should fail with a non-existent username", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/account/register")
          .send({
            email: validDetails.email,
            password: validDetails.password,
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
    });
  });
});
