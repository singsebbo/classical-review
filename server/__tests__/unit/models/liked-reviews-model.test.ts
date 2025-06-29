import database from "../../../src/database";
import ModelError from "../../../src/errors/model-error";
import LikedReviewsModel from "../../../src/models/liked-reviews-model";

jest.mock("../../../src/database");

describe("removeReviewLikes tests", (): void => {
  test("should fail if query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(
      LikedReviewsModel.removeReviewLikes("reviewId")
    ).rejects.toThrow(
      new ModelError("Database error while removing review likes.", 500)
    );
  });
  test("should successfully query the database", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue("");
    await expect(
      LikedReviewsModel.removeReviewLikes("reviewId")
    ).resolves.not.toThrow();
  });
});

describe("getLikedReviews tests", (): void => {
  test("should fail if query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(LikedReviewsModel.getLikedReviews("userId1")).rejects.toThrow(
      new ModelError("Database error while getting liked reviews.", 500)
    );
  });
  test("should successfully query the database", async (): Promise<void> => {
    const mockResult: { rows: any[] } = {
      rows: [{ review_id: "1" }, { review_id: "2" }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(LikedReviewsModel.getLikedReviews("userId1")).resolves.toEqual(
      mockResult.rows
    );
  });
});

describe("insertLikedReview tests", (): void => {
  test("should fail if query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(
      LikedReviewsModel.insertLikedReview("userId", "reviewId")
    ).rejects.toThrow(
      new ModelError("Database error while inserting liked review.", 500)
    );
  });
  test("should successfully query the database", async (): Promise<void> => {
    const mockResult: { rows: any[] } = {
      rows: [{ review_id: "1", user_id: "1" }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      LikedReviewsModel.insertLikedReview("1", "1")
    ).resolves.toEqual(mockResult.rows[0]);
  });
});

describe("removeLikedReview tests", (): void => {
  test("should fail if query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(
      LikedReviewsModel.removeLikedReview("reviewId", "userId")
    ).rejects.toThrow(
      new ModelError("Database error while deleting liked review.", 500)
    );
  });
  test("should fail if no rows were affected", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
    await expect(
      LikedReviewsModel.removeLikedReview("reviewId", "userId")
    ).rejects.toThrow(
      new ModelError("No rows affected while deleting liked review.", 500)
    );
  });
  test("should successfully remove liked review", async (): Promise<void> => {
    const mockResult: { rowCount: number; rows: any[] } = {
      rowCount: 1,
      rows: [{ review_id: "reviewId" }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      LikedReviewsModel.removeLikedReview("reviewId", "userId")
    ).resolves.toEqual(mockResult.rows[0]);
  });
});
