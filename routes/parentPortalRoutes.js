import express from "express";

import {
  getParentDashboard,
  getParentChildren,
  getParentFees,
  getParentAttendance,
  getParentResults,
  getParentMessages,
} from "../controllers/parentPortalController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
=========================================
PARENT PORTAL ROUTES
=========================================
*/

router.use(authMiddleware);

/*
GET DASHBOARD SUMMARY
GET /api/parent-portal/dashboard
*/
router.get(
  "/dashboard",
  getParentDashboard
);

/*
GET CHILDREN
GET /api/parent-portal/children
*/
router.get(
  "/children",
  getParentChildren
);

/*
GET FEES
GET /api/parent-portal/fees
*/
router.get(
  "/fees",
  getParentFees
);

/*
GET ATTENDANCE
GET /api/parent-portal/attendance
*/
router.get(
  "/attendance",
  getParentAttendance
);

/*
GET RESULTS
GET /api/parent-portal/results
*/
router.get(
  "/results",
  getParentResults
);

/*
GET MESSAGES
GET /api/parent-portal/messages
*/
router.get(
  "/messages",
  getParentMessages
);

export default router;