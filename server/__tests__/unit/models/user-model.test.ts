import database from "../../../src/database";
import UserModel from "../../../src/models/user-model";
import ModelError from "../../../src/errors/model-error";
import { User } from "../../../src/interfaces/entities";

jest.mock("../../../src/database", (): { query: jest.Mock } => ({
  query: jest.fn(),
}));

describe("createUser tests", (): void => {
  const userDetails: [string, string, string] = [
    "testuser",
    "test@domain.com",
    "hashpass",
  ];
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.createUser(...userDetails)).rejects.toThrow(
      new ModelError("Database error while creating user.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *;
      `),
      userDetails
    );
  });
  test("should fail to create user, affecting zero rows", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 0 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.createUser(...userDetails)).rejects.toThrow(
      new ModelError("User creation failed, no rows affected.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *;
      `),
      userDetails
    );
  });
  test("should successfully create and return a new user", async (): Promise<void> => {
    const mockUser: User = {
      user_id: "newuserid",
      username: userDetails[0],
      email: userDetails[1],
      password_hash: userDetails[2],
      bio: null,
      created_at: new Date(),
      last_modified_at: new Date(),
      profile_picture_url: null,
      verified: false,
      last_verification_sent: new Date(),
    };
    const mockResult: { rowCount: number; rows: User[] } = {
      rowCount: 1,
      rows: [mockUser],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.createUser(...userDetails)).resolves.toEqual(
      mockUser
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *;
      `),
      userDetails
    );
  });
});

describe("isUsernameUnique tests", (): void => {
  const userDetails: [string] = ["testuser"];
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.isUsernameUnique(...userDetails)).rejects.toThrow(
      new ModelError("Database error while checking username uniqueness.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT 1
        FROM users
        WHERE username = $1
        LIMIT 1;
      `),
      userDetails
    );
  });
  test("should return false if username exists", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [1] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.isUsernameUnique(...userDetails)).resolves.toEqual(
      false
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT 1
        FROM users
        WHERE username = $1
        LIMIT 1;
      `),
      userDetails
    );
  });
  test("should return true is username does not exist", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.isUsernameUnique(...userDetails)).resolves.toBe(
      true
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT 1
        FROM users
        WHERE username = $1
        LIMIT 1;
      `),
      userDetails
    );
  });
});

describe("isEmailUnique tests", (): void => {
  const userDetails: [string] = ["testemail@testdomain.com"];
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.isEmailUnique(...userDetails)).rejects.toThrow(
      new ModelError("Database error while checking email uniqueness.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1;
      `),
      userDetails
    );
  });
  test("should return false if email exists", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [1] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.isEmailUnique(...userDetails)).resolves.toEqual(
      false
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1;
      `),
      userDetails
    );
  });
  test("should return true is email does not exist", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.isEmailUnique(...userDetails)).resolves.toBe(true);
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT 1
        FROM users
        WHERE email = $1
        LIMIT 1;
      `),
      userDetails
    );
  });
});
