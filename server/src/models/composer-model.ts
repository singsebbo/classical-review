import { QueryResult } from "pg";
import database from "../database";
import { Composer } from "../interfaces/entities";
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
}

export default ComposerModel;
