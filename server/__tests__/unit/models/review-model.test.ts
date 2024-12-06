import database from "../../../src/database";
import ModelError from "../../../src/errors/model-error";
import ReviewModel from "../../../src/models/review-model";

jest.mock("../../../src/database");

describe("getCompositionReviews tests", (): void => {
  const compositionId = "alksdjf293ur";
  test("should fail if the query fails", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(
      ReviewModel.getCompositionReviews(compositionId)
    ).rejects.toThrow(
      new ModelError("Database error while getting composition reviews.", 500)
    );
  });
  test("should successfully get composition reviews", async (): Promise<void> => {
    const mockResult: { rows: any[] } = {
      rows: [{ review_id: "1" }, { review_id: "2" }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      ReviewModel.getCompositionReviews(compositionId)
    ).resolves.toEqual(mockResult.rows);
  });
});

describe("getUserReviews tests", (): void => {
  const userId = "abc1";
  test("should fail if the query fails", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    expect(ReviewModel.getUserReviews(userId)).rejects.toThrow(
      new ModelError("Database error while getting user reviews.", 500)
    );
  });
  test("should successfully return reviews", async (): Promise<void> => {
    const mockResult: { rows: any[] } = {
      rows: [{ review_id: "1" }, { review_id: "2" }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    expect(ReviewModel.getUserReviews(userId)).resolves.toEqual(
      mockResult.rows
    );
  });
});

describe("removeUserReview tests", (): void => {
  const compositionId = "alksdjfaajk2938";
  const userId = "alsdjfai3w9r8u";
  test("should fail if database query fails", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    expect(ReviewModel.removeUserReview(compositionId, userId)).rejects.toThrow(
      new ModelError("Database error while deleting user reviews.", 500)
    );
  });
  test("should successfully remove user review", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [{ compositionId, userId }] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    expect(
      ReviewModel.removeUserReview(compositionId, userId)
    ).resolves.toEqual(mockResult.rows);
  });
});
