import request, { Response as SupertestResponse } from "supertest";
import * as searchController from "../../../src/controllers/search-controllers";
import app from "../../../src/app";
import UserModel from "../../../src/models/user-model";
import ModelError from "../../../src/errors/model-error";
import ReviewModel from "../../../src/models/review-model";
import { Review, User } from "../../../src/interfaces/entities";

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
      test("should fail if user does not exist", async (): Promise<void> => {
        (UserModel.userExists as jest.Mock).mockResolvedValue(false);
        const response: SupertestResponse = await request(app)
          .get("/api/search/user")
          .query({ username: "thisUserDoesNotExist" });
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
          .query({ username: username });
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
          .query({ username: username });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: mockError.message,
        });
      });
    });
  });
  test("should successfully respond", async (): Promise<void> => {
    (UserModel.userExists as jest.Mock).mockResolvedValue(true);
    const mockUser: User = {
      user_id: "1",
      username: username,
      email: "",
      password_hash: "",
      bio: null,
      created_at: new Date().toISOString(),
      last_modified_at: new Date().toISOString(),
      profile_picture_url: null,
      verified: false,
      last_verification_sent: new Date().toISOString(),
      average_review: 5,
      total_reviews: 1,
    };
    const mockUserDisplayData: Partial<User> = {
      user_id: mockUser.user_id,
      username: mockUser.username,
      bio: mockUser.bio,
      created_at: mockUser.created_at,
      profile_picture_url: mockUser.profile_picture_url,
      average_review: mockUser.average_review,
      total_reviews: mockUser.total_reviews,
    };
    (UserModel.getUser as jest.Mock).mockResolvedValue(mockUser);
    const mockReviews: Review[] = [
      {
        review_id: "1",
        composition_id: "1",
        user_id: "1",
        rating: 5,
        comment: "Good",
        created_at: new Date().toISOString(),
        last_modified_at: new Date().toISOString(),
        num_liked: 0,
      },
    ];
    (ReviewModel.getUserReviews as jest.Mock).mockResolvedValue(mockReviews);
    const response: SupertestResponse = await request(app)
      .get("/api/search/user")
      .query({ username: username });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("user", mockUserDisplayData);
    expect(response.body).toHaveProperty("reviews", mockReviews);
  });
});
