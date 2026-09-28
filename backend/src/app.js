import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import bookRoutes from "./routes/book.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import rentalRoutes from "./routes/rental.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), authRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/rentals", rentalRoutes);

app.get("/api/health", (req, res) => res.json({ success: true, service: "rentbook-india-api", status: "healthy" }));

app.use(notFound);
app.use(errorHandler);

export default app;
