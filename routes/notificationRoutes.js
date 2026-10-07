import express from "express";

import {
  sendWhatsAppNotification,
  sendBulkWhatsAppNotifications,
  getNotificationHistory,
} from "../controllers/notificationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
=====================================
SECURITY
=====================================
*/

router.use(authMiddleware);
router.use(schoolMiddleware);

/*
=====================================
SEND SINGLE WHATSAPP
POST /api/notifications/whatsapp
=====================================
*/

router.post(
  "/whatsapp",
  sendWhatsAppNotification
);

/*
=====================================
SEND BULK WHATSAPP
POST /api/notifications/bulk
=====================================
*/

router.post(
  "/bulk",
  sendBulkWhatsAppNotifications
);

/*
=====================================
HISTORY
GET /api/notifications/history
=====================================
*/

router.get(
  "/history",
  getNotificationHistory
);

export default router;