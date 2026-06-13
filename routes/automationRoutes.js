import express from "express";

import {
  sendFeeReminders,
  sendResultAlerts,
  sendAttendanceAlerts,
  runDailyAutomation
} from "../controllers/automationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);

router.post("/fees", sendFeeReminders);
router.post("/results", sendResultAlerts);
router.post("/attendance", sendAttendanceAlerts);
router.post("/daily", runDailyAutomation);

export default router;