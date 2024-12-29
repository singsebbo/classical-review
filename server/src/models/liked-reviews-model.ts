import database from "../database";
import ModelError from "../errors/model-error";

class LikedReviewsModel {
  /**
   * Given a review, removes the likes from it.
   * @param {string} reviewId - The review that will have the likes removed.
   * @returns A promise that resolves to void.
   * @throws
   */
  static async removeReviewLikes(reviewId: string): Promise<void> {
    try {
      const query = `
        DELETE
        FROM liked_reviews
        WHERE review_id = $1;
      `;
      const values: [string] = [reviewId];
      await database.query(query, values);
    } catch (error: unknown) {
      throw new ModelError("Database error while removing review likes.", 500);
    }
  }
}

export default LikedReviewsModel;
