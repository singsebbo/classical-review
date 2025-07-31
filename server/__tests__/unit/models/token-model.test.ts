import database from "../../../src/database";
import TokenModel from "../../../src/models/token-model";
import ModelError from "../../../src/errors/model-error";

jest.mock("../../../src/database", (): { query: jest.Mock } => ({
  query: jest.fn(),
}));

beforeEach((): void => {
  jest.clearAllMocks();
});

describe("insertToken tests", (): void => {
  const args: { userId: string; token: string } = {
    userId: "fakeUserId12",
    token: "this.isafake.token",
  };
  beforeEach((): void => {
    jest
      .spyOn(TokenModel, "removeExistingTokens")
      .mockImplementation(jest.fn());
  });
  afterEach((): void => {
    (TokenModel.removeExistingTokens as jest.Mock).mockRestore();
  });
  test("should handle if removeExistingTokens fails", async (): Promise<void> => {
    const mockError: ModelError = new ModelError(
      "Database error while removing existing refresh tokens.",
      500
    );
    (TokenModel.removeExistingTokens as jest.Mock).mockRejectedValue(mockError);
    await expect(
      TokenModel.insertToken(args.userId, args.token)
    ).rejects.toThrow(mockError);
  });
  test("should handle if querying the database fails", async (): Promise<void> => {
    const mockError: Error = new Error("Database query failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(
      TokenModel.insertToken(args.userId, args.token)
    ).rejects.toThrow(
      new ModelError("Database error while inserting refresh token.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        INSERT INTO refresh_tokens (user_id, token)
        VALUES ($1, $2)
        ON CONFLICT (token) DO NOTHING
        RETURNING *;
      `),
      [args.userId, args.token]
    );
  });
  test("should handle if no rows were affected after querying the database", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 0 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      TokenModel.insertToken(args.userId, args.token)
    ).rejects.toThrow(
      new ModelError("No rows affected while inserting refresh token.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        INSERT INTO refresh_tokens (user_id, token)
        VALUES ($1, $2)
        ON CONFLICT (token) DO NOTHING
        RETURNING *;
      `),
      [args.userId, args.token]
    );
  });
  test("should successfully insert a refresh token", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 1 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(TokenModel.insertToken(args.userId, args.token)).resolves.toBe(
      args.token
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        INSERT INTO refresh_tokens (user_id, token)
        VALUES ($1, $2)
        ON CONFLICT (token) DO NOTHING
        RETURNING *;
      `),
      [args.userId, args.token]
    );
  });
});

describe("removeExistingTokens tests", (): void => {
  const userId: string = "thisUserID111";
  test("should handle an unsuccessful query of the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(TokenModel.removeExistingTokens(userId)).rejects.toThrow(
      new ModelError(
        "Database error while removing existing refresh tokens.",
        500
      )
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        DELETE
        FROM refresh_tokens
        WHERE user_id = $1
        RETURNING *;
      `),
      [userId]
    );
  });
  test("should successfully execute the function", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 2 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(TokenModel.removeExistingTokens(userId)).resolves.toBe(
      mockResult.rowCount
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        DELETE
        FROM refresh_tokens
        WHERE user_id = $1
        RETURNING *;
      `),
      [userId]
    );
  });
});
