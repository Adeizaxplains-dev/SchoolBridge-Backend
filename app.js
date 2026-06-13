import express from "express";
import cors from "cors";

// Core Auth
import authRoutes from "./routes/authRoutes.js";

// Core Modules
import studentRoutes from "./routes/studentRoutes.js";
import schoolRoutes from "./routes/schoolRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import parentAuthRoutes from "./routes/parentAuthRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import parentPortalRoutes from "./routes/parentPortalRoutes.js";
// Finance System
import feeRoutes from "./routes/feeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import webhookRoute from "./routes/webhookRoute.js";

// Academic System
import attendanceRoutes from "./routes/attendanceRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

// Communication
import messageRoutes from "./routes/messageRoutes.js";

// System / Insights
import analyticsRoutes from "./routes/analyticsRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";

const app = express();

/*
=================================
MIDDLEWARES
=================================
*/

app.use(
  cors({
    origin: "http://localhost:5173", // update in production (Vercel URL)
    credentials: true,
  })
);

app.use(express.json());

/*
=================================
ROOT ROUTE (IMPORTANT FOR RENDER)
=================================
*/

app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 SchoolBridge Backend API</h1>
    <p>Status: Running</p>
    <p>Use /api endpoints to access data</p>
  `);
});

/*
=================================
ROUTES (SAAS STRUCTURE)
=================================
*/

// AUTH
app.use("/api/auth", authRoutes);
app.use("/api/parents", parentRoutes);

app.use("/api/parent-auth", parentAuthRoutes);

app.use("/api/parent-portal", parentPortalRoutes);

// SCHOOL CORE
app.use("/api/schools", schoolRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/assignments", assignmentRoutes);

// FINANCE
app.use("/api/fees", feeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/webhooks", webhookRoute);

// ACADEMIC
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/upload", uploadRoutes);

// COMMUNICATION
app.use("/api/messages", messageRoutes);
app.use("/api/parents", parentRoutes);

// SYSTEM
app.use("/api/analytics", analyticsRoutes);
app.use("/api/automation", automationRoutes);

export default app;