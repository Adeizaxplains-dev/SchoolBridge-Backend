import express from "express";
import cors from "cors";


// Core Auth
import authRoutes from "./routes/authRoutes.js";

// Core Modules
import studentRoutes from "./routes/studentRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";

// Finance System
import feeRoutes from "./routes/feeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import webhookRoute from "./routes/webhookRoute.js";

// Academic System
import attendanceRoutes from "./routes/attendanceRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

// Communication
import messageRoutes from "./routes/messageRoutes.js";

// System / Insights
import analyticsRoutes from "./routes/analyticsRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend (change if different)
    credentials: true,
  })
);app.use(express.json());

// ======================
// ROUTES (SaaS STRUCTURE)
// ======================

// AUTH
app.use("/api/auth", authRoutes);

// SCHOOL CORE
app.use("/api/schools", schoolRoutes);
app.use("/api/students", studentRoutes);

// FINANCE
app.use("/api/fees", feeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/webhooks", webhookRoute);

// ACADEMIC
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);

// COMMUNICATION
app.use("/api/messages", messageRoutes);

// SYSTEM
app.use("/api/analytics", analyticsRoutes);
app.use("/api/automation", automationRoutes);

export default app;