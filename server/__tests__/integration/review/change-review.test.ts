import request, { Response as SupertestResponse } from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../src/app";
import {
  createAccessToken,
  createEmailVerificationToken,
} from "../../../src/utils/token-utils";
import ReviewModel from "../../../src/models/review-model";

jest.mock("../../../src/models/review-model");

let consoleErrorSpy: jest.SpyInstance;

beforeEach((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockRestore();
});

describe("PUT /api/review/change-review tests", (): void => {
  const bearerToken: string = createAccessToken("userId1");
  const reviewId = "1";
  const rating = 2;
  describe("Validation tests", (): void => {
    describe("Bearer token tests", (): void => {
      test("should fail if authorization header does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).put(
          "/api/review/change-review"
        );
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while changing a review"
        );
      });
      test("should fail if authorization header is not a bearer", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .put("/api/review/change-review")
          .set("Authorization", "Bear jsadklfjq9w.asdf3q9pfi.lasdkjfapsf");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while changing a review"
        );
      });
      test("should fail if authorization header does not contain a token", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .put("/api/review/change-review")
          .set("Authorization", "Bearer ");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while changing a review"
        );
      });
      test("should fail if token is signed incorrectly", async (): Promise<void> => {
        const token: string = jwt.sign("token", "key");
        const response: SupertestResponse = await request(app)
          .put("/api/review/change-review")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while changing a review"
        );
      });
      test("should fail if token is not for the purpose of access", async (): Promise<void> => {
        const token: string = createEmailVerificationToken("askdjfas");
        const response: SupertestResponse = await request(app)
          .put("/api/review/change-review")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while changing a review"
        );
      });
    });
    describe("Validator tests", (): void => {
      describe("review tests", (): void => {
        test("should fail if reviewId does not exist", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({ rating: rating });
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
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: reviewId,
              rating: rating,
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
        test("should fail if review user IDs do not match", async (): Promise<void> => {
          (ReviewModel.getReview as jest.Mock).mockResolvedValue({
            user_id: "flimflam",
          });
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: reviewId,
              rating: rating,
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message: "Review does not match user ID.",
            },
          ]);
        });
      });
      describe("rating tests", (): void => {
        beforeAll((): void => {
          (ReviewModel.getReview as jest.Mock).mockResolvedValue({
            user_id: "userId1",
          });
        });
        test("should fail if rating does not exist", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message: "Rating must exist.",
            },
          ]);
        });
        test("should fail if rating is not an integer", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
              rating: 4.2,
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message: "Rating must be an integer between 1 and 5.",
            },
          ]);
        });
        test("should fail if rating is out of range", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
              rating: 6,
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message: "Rating must be an integer between 1 and 5.",
            },
          ]);
        });
      });
      describe("comment tests", (): void => {
        beforeAll((): void => {
          (ReviewModel.getReview as jest.Mock).mockResolvedValue({
            user_id: "userId1",
          });
        });
        test("should fail if comment is not following en-US code", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
              rating: 5,
              comment: "ñoasdfajsdfpojasdjfalkfjkl",
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message:
                "Comment must be alphanumeric and follow 'en-US' language code.",
            },
          ]);
        });
        test("should fail if comment is contains special characters", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
              rating: 5,
              comment: "$%^&*()(*&^%^&*()",
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message:
                "Comment must be alphanumeric and follow 'en-US' language code.",
            },
          ]);
        });
        test("should fail if comment is less than 10 characters", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
              rating: 5,
              comment: "af",
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message: "Comment must be between 10 and 1000 characters.",
            },
          ]);
        });
        test("should fail if comment is more than 1000 characters", async (): Promise<void> => {
          let longComment: string = "";
          for (let i = 0; i < 1000; i++) {
            longComment += "adlkaskfjsk";
          }
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
              rating: 5,
              comment: longComment,
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message: "Comment must be between 10 and 1000 characters.",
            },
          ]);
        });
        test("should fail if comment contains profanity", async (): Promise<void> => {
          const response: SupertestResponse = await request(app)
            .put("/api/review/change-review")
            .set("Authorization", `Bearer ${bearerToken}`)
            .send({
              reviewId: "aslkfjaklasdf",
              rating: 5,
              comment: "shit shit shit shit",
            });
          expect(consoleErrorSpy).toHaveBeenCalled();
          expect(response.statusCode).toBe(400);
          expect(response.body).toHaveProperty("success", false);
          expect(response.body).toHaveProperty("message", [
            {
              type: "field",
              message: "Comment must not contain profanity.",
            },
          ]);
        });
      });
    });
  });
});
