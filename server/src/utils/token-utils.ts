import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export function createEmailVerificationToken(userId: string): string {
  const token: string = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "24h" });
  return token;
}
