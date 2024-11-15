import express, { Express } from "express";
import cookieParser from "cookie-parser";
import accountRoutes from "./routes/account-routes";
import searchRoutes from "./routes/search-routes";
import errorHandler from "./middlewares/error-handler";

const app: Express = express();

// Mounts global middleware
app.use(express.json());
app.use(cookieParser());

// Mounts our API routes
app.use("/api/account", accountRoutes);
app.use("/api/search", searchRoutes);

// Mounts custom error handling middleware
app.use(errorHandler);

export default app;
