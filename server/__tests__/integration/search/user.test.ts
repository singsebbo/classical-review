import request, { Response as SupertestResponse } from "supertest";
import * as searchController from "../../../src/controllers/search-controllers";
import app from "../../../src/app";
import UserModel from "../../../src/models/user-model";
import ModelError from "../../../src/errors/model-error";
import ReviewModel from "../../../src/models/review-model";

let consoleErrorSpy: jest.SpyInstance;

jest.mock("../../../src/models/user-model");
jest.mock("../../../src/models/review-model");

beforeAll((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockClear();
});

describe("GET /api/search/user tests", (): void => {
  const username = "goodusername";
  describe("Error tests", (): void => {
    test("should output validation errors to the console and not call searchComposition", async (): Promise<void> => {
      const searchUserMock: jest.SpyInstance = jest
        .spyOn(searchController, "searchUser")
        .mockImplementation(jest.fn());
      const response: SupertestResponse = await request(app).get(
        "/api/search/user"
      );
      expect(searchUserMock).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        "Validation error(s) encountered while getting user data:\n",
        expect.any(String)
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        2,
        "Validation error:\n",
        {
          type: "field",
          message: "Username must exist.",
        }
      );
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: [
          {
            type: "field",
            message: "Username must exist.",
          },
        ],
      });
      searchUserMock.mockRestore();
    });
    describe("Validation error tests", (): void => {
      test("should fail if username does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).get(
          "/api/search/user"
        );
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "Username must exist.",
            },
          ],
        });
      });
      test("should fail if username does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .get("/api/search/user")
          .send({ username: 1 });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "Username must be a string.",
            },
          ],
        });
      });
      test("should fail if user does not exist", async (): Promise<void> => {
        (UserModel.userExists as jest.Mock).mockResolvedValue(false);
        const response: SupertestResponse = await request(app)
          .get("/api/search/user")
          .send({ username: "thisUserDoesNotExist" });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: [
            {
              type: "field",
              message: "User does not exist.",
            },
          ],
        });
      });
    });
    describe("Controller error tests", (): void => {
      beforeAll((): void => {
        (UserModel.userExists as jest.Mock).mockResolvedValue(true);
      });
      test("should fail if getUser fails", async (): Promise<void> => {
        const mockError: ModelError = new ModelError("getUser error", 500);
        (UserModel.getUser as jest.Mock).mockRejectedValue(mockError);
        const response: SupertestResponse = await request(app)
          .get("/api/search/user")
          .send({ username: username });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
      test("should fail if getUserReviews fails", async (): Promise<void> => {
        (UserModel.getUser as jest.Mock).mockResolvedValue({ user_id: "1" });
        const mockError: ModelError = new ModelError(
          "getUserReviews error",
          500
        );
        (ReviewModel.getUserReviews as jest.Mock).mockRejectedValue(mockError);
        const response: SupertestResponse = await request(app)
          .get("/api/search/user")
          .send({ username: username });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
    });
  });
});
