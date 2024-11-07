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
        RETURNING *;
      `),
      [args.userId, args.token]
    );
  });
});
