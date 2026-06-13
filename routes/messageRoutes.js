import express from "express";

import {
  createMessage,
  getMessages,
  getMessage,
  sendMessage,
  scheduleMessage,
  getMessageStats
} from "../controllers/messageController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
PROTECT ALL MESSAGE ROUTES
*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*
MESSAGE DASHBOARD STATS
GET /api/messages/stats
*/
router.get("/stats", getMessageStats);

/*
ALL MESSAGES
GET /api/messages
*/
router.get("/", getMessages);

/*
CREATE MESSAGE
POST /api/messages
*/
router.post("/", createMessage);

/*
GET SINGLE MESSAGE
GET /api/messages/:id
*/
router.get("/:id", getMessage);

/*
SEND IMMEDIATELY
POST /api/messages/:id/send
*/
router.post("/:id/send", sendMessage);

/*
SCHEDULE MESSAGE
POST /api/messages/:id/schedule
*/
router.post("/:id/schedule", scheduleMessage);

export default router;