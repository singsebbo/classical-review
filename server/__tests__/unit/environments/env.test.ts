import dotenv from "dotenv";

dotenv.config();

describe("tests for existence of required environment variables", (): void => {
  test("should have DATABASE_URL defined", (): void => {
    expect(process.env.DATABASE_URL).toBeDefined();
  });
  test("should have JWT_SECRET defined", (): void => {
    expect(process.env.JWT_SECRET).toBeDefined();
  });
  test("should have SENDGRID_API_KEY defined", (): void => {
    expect(process.env.SENDGRID_API_KEY).toBeDefined();
  });
  test("should have SENDGRID_EMAIL_SENDER defined", (): void => {
    expect(process.env.SENDGRID_EMAIL_SENDER).toBeDefined();
  });
  test("should have WEBSITE_URL defined", (): void => {
    expect(process.env.WEBSITE_URL).toBeDefined();
  });
  test("should have NODE_ENV defined", (): void => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
