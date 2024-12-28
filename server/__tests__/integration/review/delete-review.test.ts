import request, { Response as SupertestResponse } from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../src/app";
import {
  createAccessToken,
  createEmailVerificationToken,
} from "../../../src/utils/token-utils";
import ReviewModel from "../../../src/models/review-model";
import ModelError from "../../../src/errors/model-error";

jest.mock("../../../src/models/review-model");

let consoleErrorSpy: jest.SpyInstance;

beforeEach((): void => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(jest.fn());
});

afterEach((): void => {
  consoleErrorSpy.mockRestore();
});

describe("DELETE /api/review/delete-review test", (): void => {
  const bearerToken: string = createAccessToken("dn4up8nps89f");
  const reviewId = "asifh32908dasihf0apwfp9";
  describe("Validation tests", (): void => {
    describe("Bearer token tests", (): void => {
      test("should fail if authorization header does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app).delete(
          "/api/review/delete-review"
        );
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while deleting a review"
        );
      });
      test("should fail if authorization header is not a bearer", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .delete("/api/review/delete-review")
          .set("Authorization", "Bear jsadklfjq9w.asdf3q9pfi.lasdkjfapsf");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while deleting a review"
        );
      });
      test("should fail if authorization header does not contain a token", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .delete("/api/review/delete-review")
          .set("Authorization", "Bearer ");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while deleting a review"
        );
      });
      test("should fail if token is signed incorrectly", async (): Promise<void> => {
        const token: string = jwt.sign("token", "key");
        const response: SupertestResponse = await request(app)
          .delete("/api/review/delete-review")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while deleting a review"
        );
      });
      test("should fail if token is not for the purpose of access", async (): Promise<void> => {
        const token: string = createEmailVerificationToken("askdjfas");
        const response: SupertestResponse = await request(app)
          .delete("/api/review/delete-review")
          .set("Authorization", `Bearer ${token}`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty(
          "message",
          "Authentication error encountered while deleting a review"
        );
      });
    });
    describe("review tests", (): void => {
      test("should fail if reviewId does not exist", async (): Promise<void> => {
        const response: SupertestResponse = await request(app)
          .delete("/api/review/delete-review")
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
          .delete("/api/review/delete-review")
          .set("Authorization", `Bearer ${bearerToken}`)
          .send({ reviewId });
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
      test("should fail if review does not match user ID", async (): Promise<void> => {
        (ReviewModel.getReview as jest.Mock).mockResolvedValue({
          user_id: "asoidfjadpfas",
        });
        const response: SupertestResponse = await request(app)
          .delete("/api/review/delete-review")
          .set("Authorization", `Bearer ${bearerToken}`)
          .send({ reviewId });
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
  });
  describe("Controller tests", (): void => {
    test("should fail if deleteReview fails", async (): Promise<void> => {
      (ReviewModel.getReview as jest.Mock).mockResolvedValue({
        user_id: "dn4up8nps89f",
      });
      const mockError: ModelError = new ModelError("Database failed");
      (ReviewModel.deleteReview as jest.Mock).mockRejectedValue(mockError);
      const response: SupertestResponse = await request(app)
        .delete("/api/review/delete-review")
        .set("Authorization", `Bearer ${bearerToken}`)
        .send({ reviewId });
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message", mockError.message);
    });
  });
});
