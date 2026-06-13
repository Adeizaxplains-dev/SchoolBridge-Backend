import express from "express";

import {
  getDashboardAnalytics,
} from "../controllers/analyticsController.js";

import {
  getAdvancedAnalytics,
} from "../controllers/advancedAnalyticsController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| SaaS Security Layer
|--------------------------------------------------------------------------
| Every analytics request must:
| 1. Be authenticated
| 2. Belong to a school tenant
|--------------------------------------------------------------------------
*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*
|--------------------------------------------------------------------------
| Dashboard Analytics
|--------------------------------------------------------------------------
| GET /api/analytics/dashboard
|--------------------------------------------------------------------------
*/
router.get(
  "/dashboard",
  getDashboardAnalytics
);

/*
|--------------------------------------------------------------------------
| Advanced Analytics
|--------------------------------------------------------------------------
| GET /api/analytics/advanced
|--------------------------------------------------------------------------
*/
router.get(
  "/advanced",
  getAdvancedAnalytics
);

export default router;