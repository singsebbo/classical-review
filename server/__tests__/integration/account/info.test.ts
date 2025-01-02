import request, { Response as SupertestResponse } from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../src/app";
import {
  createAccessToken,
  createEmailVerificationToken,
} from "../../../src/utils/token-utils";
import ReviewModel from "../../../src/models/review-model";
import LikedReviewsModel from "../../../src/models/liked-reviews-model";
import ModelError from "../../../src/errors/model-error";
import UserModel from "../../../src/models/user-model";

jest.mock("../../../src/models/user-model");
jest.mock("../../../src/models/review-model");
jest.mock("../../../src/models/liked-reviews-model");

let consoleErrorSpy: jest.SpyInstance;

beforeEach((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockRestore();
});

describe("POST /api/review/like-review test", (): void => {
  const userId = "asifh32908dasihf0apwfp9";
  const bearerToken: string = createAccessToken(userId);
  describe("Validation tests", (): void => {
    describe("Bearer token tests", (): void => {
      test("should fail if authorization header does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).get(
          "/api/account/info"
        );
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while getting account info"
        );
      });
      test("should fail if authorization header is not a bearer", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .get("/api/account/info")
          .set("Authorization", "Bear jsadklfjq9w.asdf3q9pfi.lasdkjfapsf");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while getting account info"
        );
      });
      test("should fail if authorization header does not contain a token", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .get("/api/account/info")
          .set("Authorization", "Bearer ");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while getting account info"
        );
      });
      test("should fail if token is signed incorrectly", async (): Promise<void> => {
        const token: string = jwt.sign("token", "key");
        const response: SupertestResponse = await request(app)
          .get("/api/account/info")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while getting account info"
        );
      });
      test("should fail if token is not for the purpose of access", async (): Promise<void> => {
        const token: string = createEmailVerificationToken("askdjfas");
        const response: SupertestResponse = await request(app)
          .get("/api/account/info")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while getting account info"
        );
      });
    });
  });
  describe("Controller test", (): void => {
    test("should fail if getUserDetails fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError("Fail", 500);
      (UserModel.getUserDetails as jest.Mock).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .get("/api/account/info")
        .set("Authorization", `Bearer ${bearerToken}`);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
    test("should fail if getUserReviews fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError("Fail", 500);
      (UserModel.getUserDetails as jest.Mock).mockResolvedValue({});
      (ReviewModel.getUserReviews as jest.Mock).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .get("/api/account/info")
        .set("Authorization", `Bearer ${bearerToken}`);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
    test("should fail if getLikedReviews fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError("Fail", 500);
      (UserModel.getUserDetails as jest.Mock).mockResolvedValue({});
      (ReviewModel.getUserReviews as jest.Mock).mockResolvedValue([]);
      (LikedReviewsModel.getLikedReviews as jest.Mock).mockRejectedValue(
        mockError
      );
      const response: SupertestResponse = await request(app)
        .get("/api/account/info")
        .set("Authorization", `Bearer ${bearerToken}`);
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
  });
  describe("successful tests", (): void => {
    const mockUserDetails = {
      user_id: "aksfdjasdfjaldf",
      username: "asdlfjasl;kfw9",
      email: "askjdf@asdfjald.com",
    };
    const mockUserReviews = [
      {
        review_id: "ak;ldjfp98",
      },
      {
        review_id: "asldjfaspd",
      },
    ];
    const mockLikedReviews = [
      {
        review_id: "als;dkfjaspoifas",
      },
      {
        review_id: "asdfjasldkfjas",
      },
    ];
    beforeAll((): void => {
      (UserModel.getUserDetails as jest.Mock).mockResolvedValue(
        mockUserDetails
      );
      (ReviewModel.getUserReviews as jest.Mock).mockResolvedValue(
        mockUserReviews
      );
      (LikedReviewsModel.getLikedReviews as jest.Mock).mockResolvedValue(
        mockLikedReviews
      );
    });
    test("should successfully return a response", async (): Promise<void> => {
      const response: SupertestResponse = await request(app)
        .get("/api/account/info")
        .set("Authorization", `Bearer ${bearerToken}`);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "message",
        "Successfully retrieved user information."
      );
      expect(response.body).toHaveProperty("userDetails", mockUserDetails);
      expect(response.body).toHaveProperty("userReviews", mockUserReviews);
      expect(response.body).toHaveProperty("likedReviews", mockLikedReviews);
    });
  });
});
