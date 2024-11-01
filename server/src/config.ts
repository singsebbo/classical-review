import dotenv from "dotenv";

dotenv.config();

export const PORT: number = Number(process.env.PORT);
