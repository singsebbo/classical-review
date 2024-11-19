import { QueryResult } from "pg";
import ModelError from "../errors/model-error";
import { Review } from "../interfaces/entities";
import database from "../database";

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
}

export default ReviewModel;
