import express, { Express } from "express";
import { auth } from "express-openid-connect";
import accountRoutes from "./routes/account-routes";
import errorHandler from "./middlewares/error-handler";
import { authConfig } from "./config";

const app: Express = express();

// Mounts global middleware
app.use(express.json());
app.use(auth(authConfig));

// Mounts our API routes
app.use("/api/account", accountRoutes);

// Mounts custom error handling middleware
app.use(errorHandler);

export default app;
