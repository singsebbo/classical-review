import express, { Express } from "express";
import accountRoutes from "./routes/account-routes";

const app: Express = express();

// Mounts global middleware
app.use(express.json());

// Mounts our API routes
app.use("/api/account", accountRoutes);

export default app;
