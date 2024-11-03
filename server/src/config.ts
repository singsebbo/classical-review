import dotenv from "dotenv";

dotenv.config();

export const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.AUTH_BASE_URL,
  clientID: process.env.AUTH_CLIENT_ID,
  issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL,
};
export const PORT: number = Number(process.env.PORT);
export const DATABASE_URL: string = process.env.DATABASE_URL!;
