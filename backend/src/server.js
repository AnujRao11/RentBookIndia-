import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT || 5000);

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
  } catch (error) {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

startServer();