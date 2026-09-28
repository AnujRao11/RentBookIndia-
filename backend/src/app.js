import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, service: "rentbook-india-api" }));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
