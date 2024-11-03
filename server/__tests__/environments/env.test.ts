import dotenv from "dotenv";

dotenv.config();

describe("tests for existence of required environment variables", (): void => {
  test("should have DATABASE_URL defined", (): void => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });
  test("should have AUTH_SECRET defined", (): void => {
    expect(process.env.AUTH_SECRET).toBeDefined();
  });
  test("should have AUTH_BASE_URL defined", (): void => {
    expect(process.env.AUTH_BASE_URL).toBeDefined();
  });
  test("should have AUTH_CLIENT_ID defined", (): void => {
    expect(process.env.AUTH_CLIENT_ID).toBeDefined();
  });
  test("should have AUTH_ISSUER_BASE_URL defined", (): void => {
    expect(process.env.AUTH_ISSUER_BASE_URL).toBeDefined();
  });
});
