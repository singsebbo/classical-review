import dotenv from "dotenv";

dotenv.config();

describe("tests for existence of required environment variables", (): void => {
  test("should have DATABASE_URL defined", (): void => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });
  test("should have JWT_SECRET defined", (): void => {
    expect(process.env.JWT_SECRET).toBeDefined();
  });
  test("should have WEBSITE_URL defined", (): void => {
    expect(process.env.WEBSITE_URL).toBeDefined();
  });
  test("should have NODE_ENV defined", (): void => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
  test("should have ORACLE_SMTP_USER defined", (): void => {
    expect(process.env.ORACLE_SMTP_USER).toBeDefined();
  });
  test("should have ORACLE_SMTP_PASSWORD defined", (): void => {
    expect(process.env.ORACLE_SMTP_PASSWORD).toBeDefined();
  });
  test("should have EMAIL_SENDER defined", (): void => {
    expect(process.env.EMAIL_SENDER).toBeDefined();
  });
});
