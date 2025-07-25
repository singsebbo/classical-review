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

jest.mock("../../../src/models/review-model");
jest.mock("../../../src/models/liked-reviews-model");

let consoleErrorSpy: jest.SpyInstance;

beforeEach((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockRestore();
});

describe("POST /api/review/likes test", (): void => {
  const bearerToken: string = createAccessToken("dn4up8nps89f");
  const reviewId = "asifh32908dasihf0apwfp9";
  describe("Validation tests", (): void => {
    describe("Bearer token tests", (): void => {
      test("should fail if authorization header does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).post(
          "/api/review/likes"
        );
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while liking a review"
        );
      });
      test("should fail if authorization header is not a bearer", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/review/likes")
          .set("Authorization", "Bear jsadklfjq9w.asdf3q9pfi.lasdkjfapsf");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while liking a review"
        );
      });
      test("should fail if authorization header does not contain a token", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/review/likes")
          .set("Authorization", "Bearer ");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while liking a review"
        );
      });
      test("should fail if token is signed incorrectly", async (): Promise<void> => {
        const token: string = jwt.sign("token", "key");
        const response: SupertestResponse = await request(app)
          .post("/api/review/likes")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while liking a review"
        );
      });
      test("should fail if token is not for the purpose of access", async (): Promise<void> => {
        const token: string = createEmailVerificationToken("askdjfas");
        const response: SupertestResponse = await request(app)
          .post("/api/review/likes")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while liking a review"
        );
      });
    });
    describe("likeReviewValidator tests", (): void => {
      test("should fail if reviewId does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .post("/api/review/likes")
          .set("Authorization", `Bearer ${bearerToken}`);
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Review ID must exist.",
          },
        ]);
      });
      test("should fail if review does not exist", async (): Promise<void> => {
        (ReviewModel.getReview as jest.Mock).mockResolvedValue(null);
        const response: SupertestResponse = await request(app)
          .post("/api/review/likes")
          .set("Authorization", `Bearer ${bearerToken}`)
          .send({
            reviewId: reviewId,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Review does not exist.",
          },
        ]);
      });
      test("should fail if review is already liked", async (): Promise<void> => {
        (ReviewModel.getReview as jest.Mock).mockResolvedValue({});
        (LikedReviewsModel.getLikedReviews as jest.Mock).mockResolvedValue([
          { review_id: reviewId },
        ]);
        const response: SupertestResponse = await request(app)
          .post("/api/review/likes")
          .set("Authorization", `Bearer ${bearerToken}`)
          .send({
            reviewId: reviewId,
          });
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("message", [
          {
            type: "field",
            message: "Review is already liked.",
          },
        ]);
      });
    });
  });
  describe("Controller test", (): void => {
    beforeAll((): void => {
      (ReviewModel.getReview as jest.Mock).mockResolvedValue({});
      (LikedReviewsModel.getLikedReviews as jest.Mock).mockResolvedValue([]);
    });
    test("should fail if incrementLikes fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError("Fail", 500);
      (ReviewModel.incrementLikes as jest.Mock).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .post("/api/review/likes")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          reviewId: reviewId,
        });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
    test("should fail if insertLikedReview fails", async (): Promise<void> => {
      const mockError: ModelError = new ModelError("Fail", 500);
      (ReviewModel.incrementLikes as jest.Mock).mockResolvedValue(undefined);
      (LikedReviewsModel.insertLikedReview as jest.Mock).mockRejectedValue(
        mockError
      );
      const response: SupertestResponse = await request(app)
        .post("/api/review/likes")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          reviewId: reviewId,
        });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
  });
  describe("successful tests", (): void => {
    beforeAll((): void => {
      (ReviewModel.getReview as jest.Mock).mockResolvedValue({});
      (LikedReviewsModel.getLikedReviews as jest.Mock).mockResolvedValue([]);
      (ReviewModel.incrementLikes as jest.Mock).mockResolvedValue(undefined);
      (LikedReviewsModel.insertLikedReview as jest.Mock).mockResolvedValue(
        undefined
      );
    });
    test("should successfully return a response", async (): Promise<void> => {
      const response: SupertestResponse = await request(app)
        .post("/api/review/likes")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({
          reviewId: reviewId,
        });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty(
        "message",
        "Review successfully liked."
      );
    });
  });
});
