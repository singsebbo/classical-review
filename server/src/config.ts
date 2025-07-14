import dotenv from "dotenv";

dotenv.config();

export const PORT: number = Number(process.env.PORT);
export const DATABASE_URL: string = process.env.DATABASE_URL!;
export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const ORACLE_SMTP_USER: string = process.env.ORACLE_SMTP_USER!;
export const ORACLE_SMTP_PASSWORD: string = process.env.ORACLE_SMTP_PASSWORD!;
export const WEBSITE_URL: string = process.env.WEBSITE_URL!;
export const NODE_ENV: string = process.env.NODE_ENV!;
export const EMAIL_SENDER: string = process.env.EMAIL_SENDER!;
