import { QueryResult } from "pg";
import database from "../database";
import { Composer, Composition } from "../interfaces/entities";
import ModelError from "../errors/model-error";

/** Contains the database actions for the composer table. */
class ComposerModel {
  /**
   * Inserts a composer into the database.
   * @param {string} name - Name of the composer.
   * @param {string | null} birthDate - Date of birth of the composer.
   * @param {string | null} deathDate - Date of death of the composer.
   * @returns A promise resolving to the composer that was inserted.
   * @throws A ModelError if a database error occurs.
   */
  static async insertComposer(
    name: string,
    birthDate: string | null,
    deathDate: string | null
  ): Promise<Composer> {
    try {
      const query = `
        INSERT INTO composers (name, date_of_birth, date_of_death)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const values: [string, string | null, string | null] = [
        name,
        birthDate ? birthDate : null,
        deathDate ? deathDate : null,
      ];
      const result: QueryResult<Composer> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError("No rows affected while inserting composer", 500);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Error while inserting composer into database", 500);
    }
  }

  /**
   * Gets an array of composers given the search term.
   * @param {string} searchTerm - What to search on.
   * @returns A promise that resolves to the array of composers matching the serach term.
   * @throws A ModelError if the database operation fails.
   */
  static async getComposers(searchTerm: string): Promise<Composer[]> {
    try {
      const query = `
        SELECT *
        FROM composers
        WHERE UNACCENT(name) ILIKE UNACCENT($1)
        ORDER BY name ASC;
      `;
      const values: [string] = [`%${searchTerm}%`];
      const result: QueryResult<Composer> = await database.query(query, values);
      return result.rows;
    } catch (error: unknown) {
      throw new ModelError("Database error while getting composers.", 500);
    }
  }

  /**
   * Returns a boolean that represents composer existence.
   * @param {string} composerId - The ID of the composer.
   * @returns A promise that resolves to a boolean.
   * @throws A ModelError if the database query fails.
   */
  static async composerExists(composerId: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1
        FROM composers
        WHERE composer_id = $1
        LIMIT 1;
      `;
      const values: [string] = [composerId];
      const result: QueryResult<Composer> = await database.query(query, values);
      if (result.rows.length === 1) return true;
      return false;
    } catch (error: unknown) {
      throw new ModelError(
        "Database error while checking if composer exists.",
        500
      );
    }
  }

  /**
   * Returns the composer data given the ID.
   * @param {string} composerId - The ID of the composer to find in the database.
   * @returns A promise that resolves to the composer.
   * @throws A ModelError if a database error occurs or if the composer is not found.
   */
  static async getComposer(composerId: string): Promise<Composer> {
    try {
      const query = `
        SELECT 1
        FROM composers
        WHERE composer_id = $1
        LIMIT 1;
      `;
      const values: [string] = [composerId];
      const result: QueryResult<Composer> = await database.query(query, values);
      if (result.rows.length === 0) {
        throw new ModelError("No composer with the given ID was found.", 400);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while getting composer.", 500);
    }
  }

  /**
   * Calculates and sets new review data average of a composer.
   * @param {number} rating - The rating of the new review.
   * @param {string} composerId - The composer of the piece.
   * @returns A promise that resolves to the new Composer row values.
   * @throws A ModelError if the database query fails or if no rows were affected.
   */
  static async incrementReviewData(
    rating: number,
    composerId: string
  ): Promise<Composer> {
    try {
      const query = `
          UPDATE composer
          SET
            total_reviews = total_reviews + 1,
            average_review = (average_review * (total_reviews) + $1) / (total_reviews + 1)
          WHERE composer_id = $2
          RETURNING *;
        `;
      const values: [number, string] = [rating, composerId];
      const result: QueryResult<Composer> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError(
          "No rows affected while incrementing composer review data.",
          500
        );
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error while incrementing composer review data.",
        500
      );
    }
  }

  /**
   * Calculates and sets new review data average of a composer given a changed rating.
   * @param {string} composerId - The composer who made the piece.
   * @param {number} oldRating - The value of the old rating.
   * @param {number} newRating - The value of the new rating.
   * @returns A promise that resolves to the new Composer row values.
   * @throws A ModelError if the database query fails or if no rows were affected.
   */
  static async updateReviewData(
    composerId: string,
    oldRating: number,
    newRating: number
  ): Promise<Composer> {
    try {
      const query = `
        UPDATE composers
        SET
          average_review = average_review + (($1 - $2) / total_reviews)
        WHERE composer_id = $3
        RETURNING *;
      `;
      const values: [number, number, string] = [
        newRating,
        oldRating,
        composerId,
      ];
      const result: QueryResult<Composer> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError(
          "No rows affected while updating composer review data.",
          500
        );
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error while updating composer review data.",
        500
      );
    }
  }
}

export default ComposerModel;
