import { QueryResult } from "pg";
import database from "../database";
import ModelError from "../errors/model-error";
import { LikedReview } from "../interfaces/entities";

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

  /**
   * Given a userId, gets all liked reviews.
   * @param {string} userId - The user.
   * @returns A promise that resolves to an array of liked reviews.
   * @throws A ModelError if the database operation fails.
   */
  static async getLikedReviews(userId: string): Promise<LikedReview[]> {
    try {
      const query = `
        SELECT *
        FROM liked_reviews
        WHERE user_id = $1;
      `;
      const values: [string] = [userId];
      const result: QueryResult<LikedReview> = await database.query(
        query,
        values
      );
      return result.rows;
    } catch (error: unknown) {
      throw new ModelError("Database error while getting liked reviews.", 500);
    }
  }

  /**
   * Inserts a liked review into the database.
   * @param {string} userId - The user who liked the review.
   * @param {string} reviewId - The review that was liked.
   * @returns A promise that resolves to the liked review.
   * @throws A ModelError if the database operation fails.
   */
  static async insertLikedReview(
    userId: string,
    reviewId: string
  ): Promise<LikedReview> {
    try {
      const query = `
        INSERT INTO liked_reviews (user_id, review_id)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const values: [string, string] = [userId, reviewId];
      const result: QueryResult<LikedReview> = await database.query(
        query,
        values
      );
      return result.rows[0];
    } catch (error: unknown) {
      throw new ModelError("Database error while inserting liked review.", 500);
    }
  }
}

export default LikedReviewsModel;
