import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT || 5000);

if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be set to a random value of at least 32 characters");
}

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`RentBook India API running at http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      console.error(`Could not start server: ${error.message}`);
      process.exit(1);
    });

    const shutdown = async () => {
      server.close(async () => {
        await (await import("mongoose")).default.disconnect();
        process.exit(0);
      });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

startServer();
