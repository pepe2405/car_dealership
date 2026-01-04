import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { initializeDatabase } from "./initDb";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/car_dealership";

    console.log("Attempting to connect to local MongoDB...");

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("Local MongoDB Connected Successfully!");

    await initializeDatabase();
  } catch (err) {
    console.error("MongoDB connection error:", err);

    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error during MongoDB disconnection:", err);
    process.exit(1);
  }
});
