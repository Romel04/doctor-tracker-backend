import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Health check: public, also reports whether the database is connected
app.get("/api/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "db-disconnected",
    database: dbConnected ? mongoose.connection.name : null,
  });
});

app.use("/api", routes);

// Must be last
app.use(notFound);
app.use(errorHandler);

export default app;