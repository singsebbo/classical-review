import { QueryResult } from "pg";
import database from "../database";
import { RefreshToken } from "../interfaces/entities";
import ModelError from "../errors/model-error";

/** Contains the database actions on the refresh_tokens table. */
class TokenModel {
  /**
   * Inserts a refresh token into the database.
   * @param {string} userId - The userId of the token.
   * @param {string} token - The refresh token to insert.
   * @returns A promise that resolves to a string representing the original token.
   * @throws A ModelError if the database operation is unsuccessfull.
   */
  static async insertToken(userId: string, token: string): Promise<string> {
    try {
      const query = `
        INSERT INTO refresh_tokens (user_id, token)
        VALUES ($1, $2)
        RETURNING *;
      `;
      const values: [string, string] = [userId, token];
      const result: QueryResult<RefreshToken> = await database.query(
        query,
        values
      );
      if (result.rowCount === 0) {
        throw new ModelError(
          "No rows affected while inserting refresh token.",
          500
        );
      }
      return token;
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error while inserting refresh token.",
        500
      );
    }
  }

  /**
   * Removes any existing refresh tokens associated with user.
   * @param {string} userId - The ID of the user.
   * @returns A promise that resolves to a number equal to the amount of rows removed.
   * @throws A ModelError if the database operation is unsuccessfull.
   */
  static async removeExistingTokens(userId: string): Promise<number> {
    try {
      const query = `
        DELETE
        FROM refresh_tokens
        WHERE user_id = $1
        RETURNING *;
      `;
      const values: [string] = [userId];
      const result: QueryResult<RefreshToken> = await database.query(
        query,
        values
      );
      return result.rowCount || 0;
    } catch (error: unknown) {
      throw new ModelError(
        "Database error while removing existing refresh tokens.",
        500
      );
    }
  }
}

export default TokenModel;
