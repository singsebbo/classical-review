import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { NODE_ENV, WEBSITE_URL } from "./config";
import accountRoutes from "./routes/account-routes";
import searchRoutes from "./routes/search-routes";
import reviewRoutes from "./routes/review-routes";
import errorHandler from "./middlewares/error-handler";

const app: Express = express();

app.use(
  cors({
    origin: NODE_ENV === "test" ? "*" : WEBSITE_URL,
  })
);

// Mounts global middleware
app.use(express.json());
app.use(cookieParser());

// Mounts our API routes
app.use("/api/account", accountRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/review", reviewRoutes);

// Mounts custom error handling middleware
app.use(errorHandler);

export default app;
