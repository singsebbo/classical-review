import dotenv from "dotenv";

dotenv.config();

describe("tests for existence of required environment variables", (): void => {
  test("should have DATABASE_URL defined", (): void => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });
});
