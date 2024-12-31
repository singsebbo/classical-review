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
