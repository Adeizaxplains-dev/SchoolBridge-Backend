// ============================================================
// backend/server.js
// SchoolBridge Enterprise Server
// ============================================================

import app from "./app.js";
import connectDB from "./config/db.js";

import "./cron/scheduler.js";
import "./services/feeReminderEngine.js";



// ============================================================
// ENVIRONMENT VALIDATION
// ============================================================

const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET"
];

for (const key of requiredEnv) {

    if (!process.env[key]) {

        console.error(`❌ Missing environment variable: ${key}`);

        process.exit(1);

    }

}

if (!process.env.PAYSTACK_SECRET_KEY) {

    console.warn("⚠️ PAYSTACK_SECRET_KEY missing - payment features disabled");

}



// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {

    try {

        console.log("==================================================");
        console.log("🔄 Starting SchoolBridge Enterprise Backend...");
        console.log("==================================================");

        await connectDB();

        const PORT = process.env.PORT || 5000;

        const server = app.listen(PORT, "0.0.0.0", () => {

            console.log("==================================================");
            console.log("✅ MongoDB Connected");
            console.log("🚀 SchoolBridge Backend Running");
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📡 Port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log("==================================================");

        });

        // ============================================================
        // GRACEFUL SHUTDOWN
        // ============================================================

        const shutdown = (signal) => {

            console.log(`\n🛑 ${signal} received. Shutting down...`);

            server.close(() => {

                console.log("✅ HTTP Server Closed");

                process.exit(0);

            });

        };

        process.on("SIGINT", () => shutdown("SIGINT"));

        process.on("SIGTERM", () => shutdown("SIGTERM"));

    }

    catch (error) {

        console.error("❌ Failed to start SchoolBridge");

        console.error(error);

        process.exit(1);

    }

};

startServer();



// ============================================================
// UNHANDLED PROMISE REJECTION
// ============================================================

process.on("unhandledRejection", (reason) => {

    console.error("==================================================");
    console.error("❌ Unhandled Promise Rejection");
    console.error(reason);
    console.error("==================================================");

});



// ============================================================
// UNCAUGHT EXCEPTION
// ============================================================

process.on("uncaughtException", (error) => {

    console.error("==================================================");
    console.error("❌ Uncaught Exception");
    console.error(error);
    console.error("==================================================");

    process.exit(1);

});