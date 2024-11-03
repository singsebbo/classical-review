import dotenv from "dotenv";

dotenv.config();

export const PORT: number = Number(process.env.PORT);
export const DATABASE_URL: string = process.env.DATABASE_URL!;
export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const SENDGRID_API_KEY: string = process.env.SENDGRID_API_KEY!;
export const SENDGRID_EMAIL_SENDER: string = process.env.SENDGRID_EMAIL_SENDER!;
export const WEBSITE_URL: string = process.env.WEBSITE_URL!;
