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
        WHERE user_id = $1
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
   * Checks if a user review exists.
   * @param {string} compositionId - The composition to check.
   * @param {string} userId - The user to check.
   * @returns A promise that resolves to a boolean.
   * @throws A ModelError if the database operation fails.
   */
  static async userReviewExists(
    compositionId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const query = `
        SELECT *
        FROM reviews
        WHERE composition_id = $1, user_id = $2;
      `;
      const values: [string, string] = [compositionId, userId];
      const result: QueryResult<Review> = await database.query(query, values);
      return result.rows.length > 0;
    } catch (error: unknown) {
      throw new ModelError(
        "Database query failed while checking if user review exists.",
        500
      );
    }
  }

  /**
   * Removes existing user reviews for a composition.
   * @param {string} compositionId - The composition to check.
   * @param {string} userId - The user to check.
   * @returns A promise that resolves to an array of reviews.
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

  /**
   * Inserts a review.
   * @param {ReviewData} reviewData - Contains the data necessary to create a review.
   * @returns A promise that resolves to the review.
   * @throws A ModelError if the database query fails or no rows were affected.
   */
  static async insertReview(reviewData: ReviewData): Promise<Review> {
    try {
      const query = `
        INSERT INTO reviews (composition_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values: [string, string, number, string | null] = [
        reviewData.composition_id,
        reviewData.user_id,
        reviewData.rating,
        reviewData.comment ? reviewData.comment : null,
      ];
      const result: QueryResult<Review> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError("No rows affected while inserting review.", 500);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error encountered while inserting review.",
        500
      );
    }
  }

  /**
   * Gets a review.
   * @param {string} reviewId - Contains the reviewId.
   * @returns A promise that resolves to the review or null if the review does not exist.
   * @throws A ModelError if the database query fails or no rows were affected.
   */
  static async getReview(reviewId: string): Promise<Review | null> {
    try {
      const query = `
        SELECT *
        FROM reviews
        WHERE review_id = $1
        LIMIT 1;
      `;
      const values: [string] = [reviewId];
      const result: QueryResult<Review> = await database.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error: unknown) {
      throw new ModelError(
        "Database error encountered while getting review.",
        500
      );
    }
  }

  /**
   * Deletes a review given the reviewId.
   * @param {string} reviewId - The ID of the review to delete.
   * @returns A promise that resolves to the deleted review.
   * @throws A ModelError if the database query fails or the review does not exist.
   */
  static async deleteReview(reviewId: string): Promise<Review> {
    try {
      const query = `
        DELETE
        FROM reviews
        WHERE review_id = $1
        RETURNING *;
      `;
      const values: [string] = [reviewId];
      const result: QueryResult<Review> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError("Review not found while deleting a review.", 500);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error encountered while deleting review.",
        500
      );
    }
  }

  /**
   * Updates a review given the reviewId and the new review data.
   * @param {string} reviewId - The ID of the review to change.
   * @param {number} rating - The new rating value.
   * @param {string} comment - The new comment.
   * @returns A promise that resolves to the changed review.
   * @throws A ModelError if the database query fails or the review does not exist.
   */
  static async updateReview(
    reviewId: string,
    rating: number,
    comment?: string
  ): Promise<Review> {
    try {
      const query = `
        UPDATE reviews
        SET
          rating = $2
          comment = $3
          num_liked = 0
          last_modified_at = NOW()
        WHERE review_id = $1
        RETURNING *;
      `;
      const values: [string, number, string | null] = [
        reviewId,
        rating,
        comment ? comment : null,
      ];
      const result: QueryResult<Review> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError("Review not found while changing a review.", 500);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error encountered while changing review.",
        500
      );
    }
  }

  /**
   * Increments the likes of a review.
   * @param {string} reviewId - The reviewId to increment.
   * @returns A promise that resolves to the new row values.
   * @throws A ModelError if the database operation fails or if no rows were affected.
   */
  static async incrementLikes(reviewId: string): Promise<Review> {
    try {
      const query = `
        UPDATE reviews
        SET
          num_liked = num_liked + 1
        WHERE review_id = $1
        RETURNING *;
      `;
      const values: [string] = [reviewId];
      const result: QueryResult<Review> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError("No rows affected while incrementing likes.", 500);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while incrementing likes.", 500);
    }
  }

  /**
   * Decrements the likes of a review.
   * @param {string} reviewId - The reviewId to decrement.
   * @returns A promise that resolves to the new row values.
   * @throws A ModelError if the database operation fails or if no rows were affected.
   */
  static async decrementLikes(reviewId: string): Promise<Review> {
    try {
      const query = `
        UPDATE reviews
        SET
          num_liked = num_liked - 1
        WHERE review_id = $1
        RETURNING *;
      `;
      const values: [string] = [reviewId];
      const result: QueryResult<Review> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError("No rows affected while decrementing likes.", 500);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while decrementing likes.", 500);
    }
  }
}

export default ReviewModel;
