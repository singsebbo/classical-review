import database from "../../../src/database";
import ModelError from "../../../src/errors/model-error";
import { ReviewData } from "../../../src/interfaces/request-interfaces";
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
    await expect(ReviewModel.getUserReviews(userId)).rejects.toThrow(
      new ModelError("Database error while getting user reviews.", 500)
    );
  });
  test("should successfully return reviews", async (): Promise<void> => {
    const mockResult: { rows: any[] } = {
      rows: [{ review_id: "1" }, { review_id: "2" }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(ReviewModel.getUserReviews(userId)).resolves.toEqual(
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
    await expect(
      ReviewModel.removeUserReview(compositionId, userId)
    ).rejects.toThrow(
      new ModelError("Database error while deleting user reviews.", 500)
    );
  });
  test("should successfully remove user review", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [{ compositionId, userId }] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      ReviewModel.removeUserReview(compositionId, userId)
    ).resolves.toEqual(mockResult.rows);
  });
});

describe("insertReview tests", (): void => {
  const reviewData: ReviewData = {
    composition_id: "alkdsjfasklfasl",
    user_id: "sjriwe98fijkdf",
    rating: 3,
    comment:
      "This was a good piece I liked it a lot it was very awesome and cool.",
  };
  test("should fail if database query fails", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(ReviewModel.insertReview(reviewData)).rejects.toThrow(
      new ModelError("Database error encountered while inserting review.", 500)
    );
  });
  test("should fail if no rows were affected", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 0 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(ReviewModel.insertReview(reviewData)).rejects.toThrow(
      new ModelError("No rows affected while inserting review.", 500)
    );
  });
  test("should successfully insert the review", async (): Promise<void> => {
    const mockResult: { rowCount: number; rows: any[] } = {
      rowCount: 1,
      rows: [reviewData],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(ReviewModel.insertReview(reviewData)).resolves.toEqual(
      mockResult.rows[0]
    );
  });
});

describe("userReviewExists tests", (): void => {
  const compositionId = "alsdjfalsasfajsdkf";
  const userId = "aksljfaskfjasklfasj39ru";
  test("should fail", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(
      ReviewModel.userReviewExists(compositionId, userId)
    ).rejects.toThrow(
      new ModelError(
        "Database query failed while checking if user review exists.",
        500
      )
    );
  });
  test("should successfully return true", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue({ rows: [{}] });
    await expect(
      ReviewModel.userReviewExists(compositionId, userId)
    ).resolves.toBe(true);
  });
  test("should successfully return false", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue({ rows: [] });
    await expect(
      ReviewModel.userReviewExists(compositionId, userId)
    ).resolves.toBe(false);
  });
});

describe("getReview tests", (): void => {
  test("should fail if query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(ReviewModel.getReview("reviewId")).rejects.toThrow(
      new ModelError("Database error encountered while getting review.", 500)
    );
  });
  test("should return null if review does not exist", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue({ rows: [] });
    await expect(ReviewModel.getReview("reviewId")).resolves.toEqual(null);
  });
  test("should successfully return the review", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [{ reviewId: "4" }] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(ReviewModel.getReview("reviewId")).resolves.toEqual(
      mockResult.rows[0]
    );
  });
});

describe("deleteReview tests", (): void => {
  test("should fail if query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(ReviewModel.deleteReview("reviewId")).rejects.toThrow(
      new ModelError("Database error encountered while deleting review.", 500)
    );
  });
  test("should fail if no rows were affected", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
    await expect(ReviewModel.deleteReview("reviewId")).rejects.toThrow(
      new ModelError("Review not found while deleting a review.", 500)
    );
  });
  test("should successfully return the review", async (): Promise<void> => {
    const mockResult: { rows: any[]; rowCount: number } = {
      rows: [{ reviewId: "4" }],
      rowCount: 1,
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(ReviewModel.deleteReview("reviewId")).resolves.toEqual(
      mockResult.rows[0]
    );
  });
});
