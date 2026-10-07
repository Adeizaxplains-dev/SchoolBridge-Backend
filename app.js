// ============================================================
// backend/app.js
// SchoolBridge Enterprise Application
// ============================================================

import express from "express";
import cors from "cors";
import path from "path";

const app = express();



// ============================================================
// AUTHENTICATION
// ============================================================

import authRoutes from "./routes/authRoutes.js";
import parentAuthRoutes from "./routes/parentAuthRoutes.js";
import adminImpersonationRoutes from "./routes/adminImpersonationRoutes.js";



// ============================================================
// ONBOARDING
// ============================================================

import onboardingRoutes from "./routes/onboardingRoutes.js";
import schoolSetupRoutes from "./routes/schoolSetupRoutes.js";


// ============================================================
// SCHOOL MANAGEMENT
// ============================================================

import schoolRoutes from "./routes/schoolRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";



// ============================================================
// PORTALS
// ============================================================

import teacherPortalRoutes from "./routes/teacherPortalRoutes.js";
import parentPortalRoutes from "./routes/parentPortalRoutes.js";



// ============================================================
// ACADEMICS
// ============================================================

import attendanceRoutes from "./routes/attendanceRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";



// ============================================================
// SCHOOL CONFIGURATION
// ============================================================

import feeStructureRoutes from "./routes/feeStructureRoutes.js";
import gradingSystemRoutes from "./routes/gradingSystemRoutes.js";



// ============================================================
// FINANCE
// ============================================================

import feeRoutes from "./routes/feeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";



// ============================================================
// COMMUNICATION
// ============================================================

import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";



// ============================================================
// SYSTEM
// ============================================================

import analyticsRoutes from "./routes/analyticsRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";



// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// ------------------------------------------------------------
// CORS
//
// Allowed browser origins come from CLIENT_URL (comma separated),
// e.g. CLIENT_URL=https://schoolbridge.netlify.app,http://localhost:5173
// Local Vite dev/preview origins are always allowed outside production.
// Requests without an Origin header (curl, mobile apps, webhooks,
// server-to-server) are allowed.
// ------------------------------------------------------------

const allowedOrigins = new Set(
    (process.env.CLIENT_URL || "")
        .split(",")
        .map((origin) => origin.trim().replace(/\/$/, ""))
        .filter(Boolean)
);

if (process.env.NODE_ENV !== "production") {
    [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ].forEach((origin) => allowedOrigins.add(origin));
}

// Render / Railway / Heroku sit behind a proxy
app.set("trust proxy", 1);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error(`Origin ${origin} is not allowed by CORS`)
        );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-school-id",
    ],
}));

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));



// ============================================================
// ROOT
// ============================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "SchoolBridge SaaS API Running",

        version: "1.0.0"

    });

});



// ============================================================
// HEALTH CHECK
// ============================================================

app.get(["/health", "/api/health"], (req, res) => {

    res.status(200).json({

        success: true,

        status: "healthy",

        uptime: process.uptime(),

        timestamp: new Date().toISOString()

    });

});



// ============================================================
// AUTH
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminImpersonationRoutes);

app.use("/api/parent-auth", parentAuthRoutes);



// ============================================================
// ONBOARDING
// ============================================================

app.use("/api/onboarding", onboardingRoutes);

// ============================================================
// SCHOOL SETUP
// ============================================================

app.use(
    "/api/school-setup",
    schoolSetupRoutes
);

// ============================================================
// SCHOOL MANAGEMENT
// ============================================================

app.use("/api/schools", schoolRoutes);
app.use("/api/students", studentRoutes);

app.use("/api/teachers", teacherRoutes);

app.use("/api/parents", parentRoutes);



// ============================================================
// PORTALS
// ============================================================

app.use("/api/teacher", teacherPortalRoutes);

app.use("/api/parent", parentPortalRoutes);



// ============================================================
// ACADEMICS
// ============================================================

app.use("/api/attendance", attendanceRoutes);

app.use("/api/results", resultRoutes);

app.use("/api/assignments", assignmentRoutes);



// ============================================================
// SCHOOL CONFIGURATION
// ============================================================

app.use("/api/fee-structures", feeStructureRoutes);

app.use("/api/grading-systems", gradingSystemRoutes);



// ============================================================
// FINANCE
// ============================================================

app.use("/api/fees", feeRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/subscriptions", subscriptionRoutes);

app.use("/api/invoices", invoiceRoutes);

app.use("/api/webhooks", webhookRoutes);



// ============================================================
// COMMUNICATION
// ============================================================

app.use("/api/messages", messageRoutes);

app.use("/api/notifications", notificationRoutes);



// ============================================================
// SYSTEM
// ============================================================

app.use("/api/analytics", analyticsRoutes);

app.use("/api/automation", automationRoutes);

app.use("/api/resources", resourceRoutes);

app.use("/api/upload", uploadRoutes);



// ============================================================
// STATIC FILES
// ============================================================

app.use(

    "/uploads",

    express.static(

        path.join(process.cwd(), "uploads")

    )

);



// ============================================================
// 404
// ============================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API route not found"

    });

});



// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {

    const isCorsError = /not allowed by CORS/.test(err.message || "");

    if (!isCorsError) {
        console.error(err);
    }

    res.status(isCorsError ? 403 : err.status || 500).json({

        success: false,

        message: err.message || "Internal Server Error"

    });

});



// ============================================================
// EXPORT
// ============================================================

export default app;