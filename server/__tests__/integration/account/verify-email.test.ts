import request, { Response as SupertestResponse } from "supertest";
import app from "../../../src/app";
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
  });
});
