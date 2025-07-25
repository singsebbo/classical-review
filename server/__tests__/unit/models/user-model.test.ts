import database from "../../../src/database";
import UserModel, {
  ByEmail,
  ByUserId,
  ByUsername,
} from "../../../src/models/user-model";
import ModelError from "../../../src/errors/model-error";
import { User } from "../../../src/interfaces/entities";

jest.mock("../../../src/database", (): { query: jest.Mock } => ({
  query: jest.fn(),
}));

beforeEach((): void => {
  jest.clearAllMocks();
});

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
      average_review: 0,
      total_reviews: 0,
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

describe("setUserVerified tests", (): void => {
  const args: [string] = ["1234asdfasfe34"];
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database query failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.setUserVerified(...args)).rejects.toThrow(
      new ModelError("Database error while verifying user.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        UPDATE users
        SET
          verified = true,
          last_modified_at = NOW()
        WHERE user_id = $1
        RETURNING *;
      `),
      args
    );
  });
  test("should fail to verify user, affecting zero rows", async (): Promise<void> => {
    const mockResult: { rowCount: number } = { rowCount: 0 };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.setUserVerified(...args)).rejects.toThrow(
      new ModelError("User verification failed, no rows affected.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        UPDATE users
        SET
          verified = true,
          last_modified_at = NOW()
        WHERE user_id = $1
        RETURNING *;
      `),
      args
    );
  });
  test("should successfully verify and return the user", async (): Promise<void> => {
    const mockUser: User = {
      user_id: args[0],
      username: "thisisausername",
      email: "email@email.mail",
      password_hash:
        "asdfihq9jornh384ijrsf934fjnfqw9pfiojnwe09prguoijsnpusfoijasd",
      bio: null,
      created_at: new Date(),
      last_modified_at: new Date(),
      profile_picture_url: null,
      verified: false,
      last_verification_sent: new Date(),
      average_review: 0,
      total_reviews: 0,
    };
    const mockResult: { rowCount: number; rows: User[] } = {
      rowCount: 1,
      rows: [mockUser],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.setUserVerified(...args)).resolves.toEqual(mockUser);
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        UPDATE users
        SET
          verified = true,
          last_modified_at = NOW()
        WHERE user_id = $1
        RETURNING *;
      `),
      args
    );
  });
});

describe("getUserResult tests", (): void => {
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    const userIdentifier: ByUserId = { userId: "1" };
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.getUserResult(userIdentifier)).rejects.toThrow(
      new ModelError("Database error while getting user.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE user_id = $1
        LIMIT 1;
      `),
      [userIdentifier.userId]
    );
  });
  test("should successfully query the database using userId", async (): Promise<void> => {
    const mockResult: { rows: any[]; rowCount: number } = {
      rows: [],
      rowCount: 0,
    };
    const userIdentifier: ByUserId = { userId: "1" };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUserResult(userIdentifier)).resolves.toBe(
      mockResult
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE user_id = $1
        LIMIT 1;
      `),
      [userIdentifier.userId]
    );
  });
  test("should successfully query the database using username", async (): Promise<void> => {
    const mockResult: { rows: any[]; rowCount: number } = {
      rows: [],
      rowCount: 0,
    };
    const userIdentifier: ByUsername = { username: "1" };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUserResult(userIdentifier)).resolves.toBe(
      mockResult
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE username = $1
        LIMIT 1;
      `),
      [userIdentifier.username]
    );
  });
  test("should successfully query the database using email", async (): Promise<void> => {
    const mockResult: { rows: any[]; rowCount: number } = {
      rows: [],
      rowCount: 0,
    };
    const userIdentifier: ByEmail = { email: "1" };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUserResult(userIdentifier)).resolves.toBe(
      mockResult
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1;
      `),
      [userIdentifier.email]
    );
  });
});

describe("userExistsAndIsVerified tests", (): void => {
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    const userIdentifier: ByUserId = { userId: "1" };
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(
      UserModel.userExistsAndIsVerified(userIdentifier)
    ).rejects.toThrow(
      new ModelError("Database error while getting user.", 500)
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE user_id = $1
        LIMIT 1;
      `),
      [userIdentifier.userId]
    );
  });
  test("should fail if user does not exist", async (): Promise<void> => {
    const userIdentifier: ByEmail = { email: "1" };
    (database.query as jest.Mock).mockResolvedValue({ rows: [] });
    await expect(
      UserModel.userExistsAndIsVerified(userIdentifier)
    ).rejects.toThrow(
      new ModelError(
        "No user found.",
        400,
        "Checking if user exists and is verified."
      )
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE email = $1
        LIMIT 1;
      `),
      [userIdentifier.email]
    );
  });
  test("should fail if user is not verified", async (): Promise<void> => {
    const userIdentifier: ByUsername = { username: "person" };
    (database.query as jest.Mock).mockResolvedValue({
      rows: [{ verified: false }],
    });
    await expect(
      UserModel.userExistsAndIsVerified(userIdentifier)
    ).rejects.toThrow(
      new ModelError(
        "User is unverified.",
        400,
        "Checking if user exists and is verified."
      )
    );
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE username = $1
        LIMIT 1;
      `),
      [userIdentifier.username]
    );
  });
  test("should successfully check if the user exists and is verified", async (): Promise<void> => {
    const userIdentifier: ByUsername = { username: "person" };
    (database.query as jest.Mock).mockResolvedValue({
      rows: [{ verified: true }],
    });
    await expect(
      UserModel.userExistsAndIsVerified(userIdentifier)
    ).resolves.toBe(true);
    expect(database.query).toHaveBeenCalledWith(
      expect.stringContaining(`
        SELECT *
        FROM users
        WHERE username = $1
        LIMIT 1;
      `),
      [userIdentifier.username]
    );
  });
});

describe("getPasswordHash tests", (): void => {
  const userIdentifier: ByUserId = { userId: "1" };
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.getPasswordHash(userIdentifier)).rejects.toThrow();
  });
  test("should fail if no user is found", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getPasswordHash(userIdentifier)).rejects.toThrow(
      new ModelError("No user found while getting password hash.", 400)
    );
  });
  test("should successfully return the password hash", async (): Promise<void> => {
    const hashedPassword = "asdf";
    const mockResult: { rows: any[] } = {
      rows: [{ password_hash: hashedPassword }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getPasswordHash(userIdentifier)).resolves.toBe(
      hashedPassword
    );
  });
});

describe("getUserId tests", (): void => {
  const userIdentifier: ByUserId = { userId: "1" };
  test("should unsuccessfully query the database", async (): Promise<void> => {
    const mockError: Error = new Error("Database connection failed");
    (database.query as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.getUserId(userIdentifier)).rejects.toThrow();
  });
  test("should fail if no user is found", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUserId(userIdentifier)).rejects.toThrow(
      new ModelError("No user found while getting user ID.", 400)
    );
  });
  test("should successfully return the password hash", async (): Promise<void> => {
    const userId = "1";
    const mockResult: { rows: any[] } = {
      rows: [{ user_id: userId }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUserId(userIdentifier)).resolves.toBe(userId);
  });
});

describe("userExists tests", (): void => {
  let getUserResultMock: jest.SpyInstance;
  beforeEach((): void => {
    getUserResultMock = jest
      .spyOn(UserModel, "getUserResult")
      .mockImplementation(jest.fn());
  });
  afterAll((): void => {
    getUserResultMock.mockRestore();
  });
  const uniqueIdentifier: ByUsername = { username: "testuser" };
  test("getUserResult throws a ModelError", async (): Promise<void> => {
    const mockError: ModelError = new ModelError(
      "Database connection failed",
      500
    );
    (UserModel.getUserResult as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.userExists(uniqueIdentifier)).rejects.toThrow(
      mockError
    );
  });
  test("getUserResult throws a non ModelError", async (): Promise<void> => {
    const mockError: Error = new Error("Random error");
    (UserModel.getUserResult as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.userExists(uniqueIdentifier)).rejects.toThrow(
      new ModelError(
        "An unexpected error has occurred while checking user existence.",
        500
      )
    );
  });
  test("successfully returns false", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [] };
    (UserModel.getUserResult as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.userExists(uniqueIdentifier)).resolves.toBe(false);
  });
  test("successfully returns true", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [{}] };
    (UserModel.getUserResult as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.userExists(uniqueIdentifier)).resolves.toBe(true);
  });
});

describe("getUser tests", (): void => {
  let getUserResultMock: jest.SpyInstance;
  beforeEach((): void => {
    getUserResultMock = jest
      .spyOn(UserModel, "getUserResult")
      .mockImplementation(jest.fn());
  });
  afterAll((): void => {
    getUserResultMock.mockRestore();
  });
  const uniqueIdentifier: ByUsername = { username: "testuser" };
  test("getUserResult throws a ModelError", async (): Promise<void> => {
    const mockError: ModelError = new ModelError(
      "Database connection failed",
      500
    );
    (UserModel.getUserResult as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.getUser(uniqueIdentifier)).rejects.toThrow(
      mockError
    );
  });
  test("getUserResult throws a non ModelError", async (): Promise<void> => {
    const mockError: Error = new Error("Random error");
    (UserModel.getUserResult as jest.Mock).mockRejectedValue(mockError);
    await expect(UserModel.getUser(uniqueIdentifier)).rejects.toThrow(
      new ModelError(
        "An unexpected error has occurred while getting user.",
        500
      )
    );
  });
  test("no user is found", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [] };
    (UserModel.getUserResult as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUser(uniqueIdentifier)).rejects.toThrow(
      new ModelError("No user found while getting user.", 400)
    );
  });
  test("successfully returns the user", async (): Promise<void> => {
    const mockResult: { rows: User[] } = {
      rows: [
        {
          user_id: "userid",
          username: "username",
          email: "email@domain.com",
          password_hash: "thispasswordHash12",
          bio: null,
          created_at: new Date(),
          last_modified_at: new Date(),
          profile_picture_url: null,
          verified: false,
          last_verification_sent: new Date(),
          average_review: 3,
          total_reviews: 12,
        },
      ],
    };
    (UserModel.getUserResult as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUser(uniqueIdentifier)).resolves.toEqual(
      mockResult.rows[0]
    );
  });
});

describe("incrementReviewData tests", (): void => {
  const rating = 5;
  const userId = "ksajdalf2u34ou32o423";
  test("should fail if database query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(UserModel.incrementReviewData(rating, userId)).rejects.toThrow(
      new ModelError("Database error while incrementing user review data.", 500)
    );
  });
  test("should fail if rowCount is 0", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
    await expect(UserModel.incrementReviewData(rating, userId)).rejects.toThrow(
      new ModelError(
        "No rows affected while incrementing user review data.",
        500
      )
    );
  });
  test("should successfully increment review data", async (): Promise<void> => {
    const mockResult: { rowCount: number; rows: any[] } = {
      rowCount: 1,
      rows: [{ rating, userId }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(
      UserModel.incrementReviewData(rating, userId)
    ).resolves.toEqual(mockResult.rows[0]);
  });
});

describe("updateReviewData tests", (): void => {
  const args: [string, number, number] = ["a", 1, 2];
  test("should fail if database query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(UserModel.updateReviewData(...args)).rejects.toThrow(
      new ModelError("Database error while updating user review data.", 500)
    );
  });
  test("should fail if rowCount is 0", async (): Promise<void> => {
    (database.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
    await expect(UserModel.updateReviewData(...args)).rejects.toThrow(
      new ModelError("No rows affected while updating user review data.", 500)
    );
  });
  test("should successfully return the updated user review data", async (): Promise<void> => {
    const mockResult: { rowCount: number; rows: any[] } = {
      rowCount: 1,
      rows: [{ user_id: "1" }],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.updateReviewData(...args)).resolves.toEqual(
      mockResult.rows[0]
    );
  });
});

describe("getUserDetails tests", (): void => {
  test("should fail if database query fails", async (): Promise<void> => {
    (database.query as jest.Mock).mockRejectedValue(new Error());
    await expect(UserModel.getUserDetails("userId")).rejects.toThrow(
      new ModelError("Database error while getting user data.", 500)
    );
  });
  test("should fail if query result has no rows", async (): Promise<void> => {
    const mockResult: { rows: any[] } = { rows: [] };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUserDetails("userId")).rejects.toThrow(
      new ModelError("No users found while getting user details.", 500)
    );
  });
  test("should successfully return the user without the password hash", async (): Promise<void> => {
    const mockResult: { rows: any[] } = {
      rows: [
        {
          password_hash: "akjf90q83uriajf98qufpjs9adfasfw38fwuj",
          user_id: "1",
        },
      ],
    };
    (database.query as jest.Mock).mockResolvedValue(mockResult);
    await expect(UserModel.getUserDetails("userId")).resolves.toEqual({
      user_id: "1",
    });
  });
});
