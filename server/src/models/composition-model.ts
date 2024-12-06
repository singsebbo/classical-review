import { QueryResult } from "pg";
import database from "../database";
import { Composition } from "../interfaces/entities";
import ModelError from "../errors/model-error";

/** Contains the database actions on the composition table. */
class CompositionModel {
  /**
   *
   * @param {string} composerId - The ID of the composer who composed the piece.
   * @param {string} title - The title of piece composed.
   * @param {string} subtitle - The subtitle of the piece composed.
   * @param {string} genre - The genre of the piece composed.
   * @returns A promise that resolves to the composition inserted.
   * @throws A ModelError if the database operation fails.
   */
  static async insertComposition(
    composerId: string,
    title: string,
    subtitle: string,
    genre: string
  ): Promise<Composition> {
    try {
      const query = `
        INSERT INTO compositions (composer_id, title, subtitle, genre)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const values: [string, string, string, string] = [
        composerId,
        title,
        subtitle,
        genre,
      ];
      const result: QueryResult<Composition> = await database.query(
        query,
        values
      );
      if (result.rowCount === 0) {
        throw new ModelError(
          "No rows affected while inserting composition.",
          500
        );
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while inserting composition.", 500);
    }
  }

  /**
   * Gets an array of compositions given the search term.
   * @param {string} searchTerm - What to search on.
   * @returns A promise that resolves to the array of composers matching the serach term.
   * @throws A ModelError if the database operation fails.
   */
  static async getCompositions(searchTerm: string): Promise<Composition[]> {
    try {
      const query = `
        SELECT *
        FROM compositions
        WHERE UNACCENT(title) ILIKE UNACCENT($1)
        ORDER BY title ASC;
      `;
      const values: [string] = [`%${searchTerm}%`];
      const result: QueryResult<Composition> = await database.query(
        query,
        values
      );
      return result.rows;
    } catch (error: unknown) {
      throw new ModelError("Database error while getting compositions.", 500);
    }
  }

  /**
   * Gets the compositions of a composer given the composer's ID.
   * @param {string} composerId - The ID of the composer.
   * @returns A promise that resolves to an array of compositions.
   * @throws A ModelError if the database query fails.
   */
  static async getComposerWorks(composerId: string): Promise<Composition[]> {
    try {
      const query = `
          SELECT *
          FROM compositions
          WHERE composer_id = $1;
        `;
      const values: [string] = [composerId];
      const result: QueryResult<Composition> = await database.query(
        query,
        values
      );
      return result.rows;
    } catch (error: unknown) {
      throw new ModelError("Database error while getting composer works.", 500);
    }
  }

  /**
   * Checks if the given composition exists.
   * @param {string} compositionId - The composition ID to search for.
   * @returns A promise that resolves to a boolean representing if the composition exists.
   * @throws A ModelError if the database operation fails.
   */
  static async compositionExists(compositionId: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1
        FROM compositions
        WHERE composition_id = $1
        LIMIT 1;
      `;
      const values: [string] = [compositionId];
      const result: QueryResult<Composition> = await database.query(
        query,
        values
      );
      if (result.rows.length === 1) {
        return true;
      }
      return false;
    } catch (error: unknown) {
      throw new ModelError(
        "Database error while checking if composition exists.",
        500
      );
    }
  }

  /**
   * Returns the composition data given the ID.
   * @param {string} compositionId - The ID of the composition to find in the database.
   * @returns A promise that resolves to the composition.
   * @throws A ModelError if a database error occurs or if the composition is not found.
   */
  static async getComposition(compositionId: string): Promise<Composition> {
    try {
      const query = `
          SELECT 1
          FROM compositions
          WHERE composition_id = $1
          LIMIT 1;
        `;
      const values: [string] = [compositionId];
      const result: QueryResult<Composition> = await database.query(
        query,
        values
      );
      if (result.rows.length === 0) {
        throw new ModelError(
          "No composition with the given ID was found.",
          400
        );
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while getting composition.", 500);
    }
  }

  /**
   * Calculates and sets new review data average of a composition.
   * @param {number} rating - The rating of the new review.
   * @param {string} compositionId - The composition of the review.
   * @returns A promise that resolves to the new Composition row values.
   * @throws A ModelError if the database query fails or if no rows were affected.
   */
  static async incrementReviewData(
    rating: number,
    compositionId: string
  ): Promise<Composition> {
    try {
      const query = `
        UPDATE compositions
        SET
          total_reviews = total_reviews + 1,
          average_review = (average_review * (total_reviews) + $1) / (total_reviews + 1)
        WHERE composition_id = $2
        RETURNING *;
      `;
      const values: [number, string] = [rating, compositionId];
      const result: QueryResult<Composition> = await database.query(
        query,
        values
      );
      if (result.rowCount === 0) {
        throw new ModelError(
          "No rows affected while incrementing composition review data.",
          500
        );
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error while incrementing composition review data.",
        500
      );
    }
  }
}

export default CompositionModel;
