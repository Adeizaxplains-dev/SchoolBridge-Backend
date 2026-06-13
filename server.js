import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

/*
=========================================
🔐 ENV VALIDATION (SAAS SAFETY)
=========================================
*/

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

/*
⚠️ OPTIONAL SERVICES (DO NOT CRASH SERVER)
*/

if (!process.env.PAYSTACK_SECRET_KEY) {
  console.warn("⚠️ PAYSTACK_SECRET_KEY missing (payments disabled)");
}

/*
=========================================
🚀 START SERVER
=========================================
*/

const startServer = async () => {
  try {
    console.log("=================================");
    console.log("🔄 Starting SchoolBridge Backend...");
    console.log("=================================");

    console.log("🔄 Connecting to database...");

    await connectDB();

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("=================================");
      console.log("🚀 SchoolBridge Backend Running");
      console.log(`📡 Port: ${PORT}`);
      console.log("🌍 Environment: ${process.env.NODE_ENV || 'development'}");
      console.log("=================================");
    });

    /*
      Graceful shutdown (important for Render)
    */
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();