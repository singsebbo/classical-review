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
}

export default CompositionModel;
