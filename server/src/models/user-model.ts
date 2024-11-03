import { QueryResult } from "pg";
import database from "../database";
import ModelError from "../errors/model-error";
import { User } from "../interfaces/entities";

/** Contains the database actions on the users table. */
class UserModel {
  /**
   * Creates and inserts a new user into the database.
   * @param {string} username - The username of the new user.
   * @param {string} email - The email of the new user.
   * @param {string} password_hash - The hashed password of the new user.
   * @returns A promise that resolves to the new user's details.
   * @throws Throws a ModelError if creating the user fails.
   */
  static async createUser(
    username: string,
    email: string,
    password_hash: string
  ): Promise<User> {
    try {
      const query = `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const values: [string, string, string] = [username, email, password_hash];
      const result: QueryResult<User> = await database.query<User>(
        query,
        values
      );
      if (result.rowCount === 0) {
        throw new ModelError("User creation failed, no rows affected.", 500);
      }
      const insertedUser: User = result.rows[0];
      return insertedUser;
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while creating user.", 500);
    }
  }

  /**
   * Checks if a username is unique.
   * @param {string} username - The username to check.
   * @returns A promise that resolves to true if the username is taken and false otherwise.
   * @throws A ModelError if running the query fails.
   */
  static async isUsernameTaken(username: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1
        FROM users
        WHERE username = $1
        LIMIT 1;
      `;
      const values: [string] = [username];
      const result: QueryResult<User> = await database.query(query, values);
      return result.rows.length > 0;
    } catch (error: unknown) {
      throw new ModelError(
        "Database error while checking username uniqueness.",
        500
      );
    }
  }
}

export default UserModel;
