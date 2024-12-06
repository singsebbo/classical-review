import { QueryResult } from "pg";
import ModelError from "../errors/model-error";
import { Review } from "../interfaces/entities";
import database from "../database";
import { ReviewData } from "../interfaces/request-interfaces";

class ReviewModel {
  /**
   * Gets all reviews of a particular composition.
   * @param {string} compositionId - The composition ID of the review to look for.
   * @returns A promise that resolves to an array of reviews.
   * @throws A ModelError if a database error occurs.
   */
  static async getCompositionReviews(compositionId: string): Promise<Review[]> {
    try {
      const query = `
        SELECT *
        FROM reviews
        WHERE composition_id = $1
        ORDER BY num_liked DESC;
      `;
      const values: [string] = [compositionId];
      const result: QueryResult<Review> = await database.query(query, values);
      return result.rows;
    } catch (error: unknown) {
      throw new ModelError(
        "Database error while getting composition reviews.",
        500
      );
    }
  }

  /**
   * Gets all reviews from the given user.
   * @param {string} userId - The userId of the reviews to search.
   * @returns A promise that resolves to an array of reviews.
   * @throws A ModelError if the database operation fails.
   */
  static async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const query = `
        SELECT *
        FROM reviews
        WHERE user_id = $1;
        ORDER BY num_liked DESC;
      `;
      const values: [string] = [userId];
      const result: QueryResult<Review> = await database.query(query, values);
      return result.rows;
    } catch (error: unknown) {
      throw new ModelError("Database error while getting user reviews.", 500);
    }
  }

  /**
   * Removes existing user reviews for a composition.
   * @param {string} compositionId - The composition to check.
   * @param {string} userId - The user to check.
   * @returns A promise that resolves to void.
   * @throws A ModelError if the database query fails.
   */
  static async removeUserReview(
    compositionId: string,
    userId: string
  ): Promise<Review[]> {
    try {
      const query = `
        DELETE
        FROM reviews
        WHERE composition_id = $1, user_id = $2
        RETURNING *;
      `;
      const values: [string, string] = [compositionId, userId];
      const result: QueryResult<Review> = await database.query(query, values);
      return result.rows;
    } catch (error: unknown) {
      throw new ModelError("Database error while deleting user reviews.", 500);
    }
  }
}

export default ReviewModel;
