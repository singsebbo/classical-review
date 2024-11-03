import express, { Express } from "express";
import accountRoutes from "./routes/account-routes";
import errorHandler from "./middlewares/error-handler";

const app: Express = express();

// Mounts global middleware
app.use(express.json());

// Mounts our API routes
app.use("/api/account", accountRoutes);

// Mounts custom error handling middleware
app.use(errorHandler);

export default app;
