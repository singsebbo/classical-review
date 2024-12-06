import { QueryResult } from "pg";
import database from "../database";
import ModelError from "../errors/model-error";
import { User } from "../interfaces/entities";

export interface ByUserId {
  userId: string;
  username?: never;
  email?: never;
}

export interface ByUsername {
  userId?: never;
  username: string;
  email?: never;
}

export interface ByEmail {
  userId?: never;
  username?: never;
  email: string;
}

type UserIdentifier = ByUserId | ByUsername | ByEmail;

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
   * @returns A promise that resolves to false if the username is taken and true otherwise.
   * @throws A ModelError if running the query fails.
   */
  static async isUsernameUnique(username: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1
        FROM users
        WHERE username = $1
        LIMIT 1;
      `;
      const values: [string] = [username];
      const result: QueryResult<User> = await database.query(query, values);
      return result.rows.length === 0;
    } catch (error: unknown) {
      throw new ModelError(
        "Database error while checking username uniqueness.",
        500
      );
    }
  }

  /**
   * Checks if an email is unique.
   * @param {string} email - The email to check.
   * @returns A promise that resolves to false if the email is taken and true otherwise.
   * @throws A ModelError if running the query fails.
   */
  static async isEmailUnique(email: string): Promise<boolean> {
    try {
      const query = `
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1;
      `;
      const values: [string] = [email];
      const result: QueryResult<User> = await database.query(query, values);
      return result.rows.length === 0;
    } catch (error: unknown) {
      throw new ModelError(
        "Database error while checking email uniqueness.",
        500
      );
    }
  }

  /**
   * Sets a user's verified status to true.
   * @param {string} userId - The userId of the user to verify.
   * @returns The newly verified user.
   * @throws A ModelError if the database operation fails.
   */
  static async setUserVerified(userId: string): Promise<User> {
    try {
      const query = `
        UPDATE users
        SET
          verified = true
          last_modified_at = NOW()
        WHERE user_id = $1
        RETURNING *;
      `;
      const values: [string] = [userId];
      const result: QueryResult<User> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError(
          "User verification failed, no rows affected.",
          500
        );
      }
      const verifiedUser: User = result.rows[0];
      return verifiedUser;
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while verifying user.", 500);
    }
  }

  /**
   * Gets a user.
   * @param {UserIndentifier} uniqueIndentifier - Either a userId, username, or email.
   * @returns The QueryResult containing the user.
   * @throws A ModelError if the query fails.
   */
  static async getUserResult(
    uniqueIndentifier: UserIdentifier
  ): Promise<QueryResult<User>> {
    try {
      let whereCondition: string;
      let values: [string];
      if (uniqueIndentifier.userId) {
        whereCondition = "user_id = $1";
        values = [uniqueIndentifier.userId];
      } else if (uniqueIndentifier.username) {
        whereCondition = "username = $1";
        values = [uniqueIndentifier.username];
      } else {
        whereCondition = "email = $1";
        values = [uniqueIndentifier.email!];
      }
      const query = `
        SELECT 1
        FROM users
        WHERE ${whereCondition}
        LIMIT 1;
      `;
      return await database.query(query, values);
    } catch (error: unknown) {
      throw new ModelError("Database error while getting user.", 500);
    }
  }

  /**
   * Checks if a user exists and is verified.
   * @param {UserIdentifier} uniqueIndentifier - Either a userId, username, or email.
   * @returns A promise that resolves to true if the user exists and is verified.
   * @throws A ModelError if no user is found, or if an error occurs while querying the database.
   */
  static async userExistsAndIsVerified(
    uniqueIndentifier: UserIdentifier
  ): Promise<boolean> {
    try {
      const result: QueryResult<User> = await UserModel.getUserResult(
        uniqueIndentifier
      );
      if (result.rows.length === 0) {
        throw new ModelError(
          "No user found.",
          400,
          "Checking if user exists and is verified."
        );
      }
      if (!result.rows[0].verified) {
        throw new ModelError(
          "User is unverified.",
          400,
          "Checking if user exists and is verified."
        );
      }
      return true;
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error while checking if user exists and is verified.",
        500
      );
    }
  }

  /**
   * Gets the password hash of a user given the username.
   * @param {UserIdentifier} uniqueIndentifier - Either a userId, username, or email.
   * @returns A promise that resolves to a string representing their hashed password.
   * @throws A ModelError if no user is found, or if an error occurs while querying the database.
   */
  static async getPasswordHash(
    uniqueIndentifier: UserIdentifier
  ): Promise<string> {
    try {
      const result: QueryResult<User> = await UserModel.getUserResult(
        uniqueIndentifier
      );
      if (result.rows.length === 0) {
        throw new ModelError("No user found while getting password hash.", 400);
      }
      const passwordHash: string = result.rows[0].password_hash;
      return passwordHash;
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while getting password hash.", 500);
    }
  }

  /**
   * Gets the user ID given a unique identifier.
   * @param {UserIndentifier} uniqueIndentifier - Either a userId, username, or email.
   * @returns A promise that resolves to a string representing the userId.
   * @throws A ModelError if a database error occurs, or if no user is found.
   */
  static async getUserId(uniqueIndentifier: UserIdentifier): Promise<string> {
    try {
      const result: QueryResult<User> = await UserModel.getUserResult(
        uniqueIndentifier
      );
      if (result.rows.length === 0) {
        throw new ModelError("No user found while getting user ID.", 400);
      }
      const userId: string = result.rows[0].user_id;
      return userId;
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError("Database error while getting user ID.", 500);
    }
  }

  /**
   * Returns a boolean representing whether the user exists.
   * @param {UserIdentifier} uniqueIndentifier - Either a userId, username, or email.
   * @returns A promise that resolves to a boolean representing if the user exists.
   * @throws A ModelError if a database error occurs.
   */
  static async userExists(uniqueIndentifier: UserIdentifier): Promise<boolean> {
    try {
      const result: QueryResult<User> = await UserModel.getUserResult(
        uniqueIndentifier
      );
      if (result.rows.length === 0) {
        return false;
      }
      return true;
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "An unexpected error has occurred while checking user existence.",
        500
      );
    }
  }

  /**
   * Returns a user.
   * @param {UserIdentifier} uniqueIndentifier - Either a userId, username, or email.
   * @returns A promise that resolves to user.
   * @throws A ModelError if a database error occurs or if no user is found.
   */
  static async getUser(uniqueIndentifier: UserIdentifier): Promise<User> {
    try {
      const result: QueryResult<User> = await UserModel.getUserResult(
        uniqueIndentifier
      );
      if (result.rows.length === 0) {
        throw new ModelError("No user found while getting user.", 400);
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "An unexpected error has occurred while getting user.",
        500
      );
    }
  }

  /**
   * Calculates and sets new review data average of a user.
   * @param {number} rating - The rating of the new review.
   * @param {string} userId - The user who made the review.
   * @returns A promise that resolves to the new User row values.
   * @throws A ModelError if the database query fails or if no rows were affected.
   */
  static async incrementReviewData(
    rating: number,
    userId: string
  ): Promise<User> {
    try {
      const query = `
        UPDATE users
        SET
          total_reviews = total_reviews + 1,
          average_review = (average_review * (total_reviews) + $1) / (total_reviews + 1)
        WHERE user_id = $2
        RETURNING *;
      `;
      const values: [number, string] = [rating, userId];
      const result: QueryResult<User> = await database.query(query, values);
      if (result.rowCount === 0) {
        throw new ModelError(
          "No rows affected while incrementing user review data.",
          500
        );
      }
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof ModelError) {
        throw error;
      }
      throw new ModelError(
        "Database error while incrementing user review data.",
        500
      );
    }
  }
}

export default UserModel;
