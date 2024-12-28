import request, { Response as SupertestResponse } from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../src/app";
import {
  createAccessToken,
  createEmailVerificationToken,
} from "../../../src/utils/token-utils";

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
  });
});
