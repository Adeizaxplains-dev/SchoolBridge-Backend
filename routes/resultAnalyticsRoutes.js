import express from "express";

import {
  getResultDashboardAnalytics,
  getClassResultAnalytics,
  getStudentResultAnalytics,
  getSubjectAnalytics,
  getResultRankingAnalytics,
  getTermPerformanceAnalytics,
} from "../controllers/resultAnalyticsController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
=====================================
GLOBAL SAAS SECURITY LAYER
=====================================
*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*
=====================================
DASHBOARD RESULT ANALYTICS
GET /api/results/analytics/dashboard
=====================================
*/
router.get(
  "/dashboard",
  getResultDashboardAnalytics
);

/*
=====================================
CLASS PERFORMANCE ANALYTICS
GET /api/results/analytics/class/:className
=====================================
*/
router.get(
  "/class/:className",
  getClassResultAnalytics
);

/*
=====================================
STUDENT PERFORMANCE ANALYTICS
GET /api/results/analytics/student/:studentId
=====================================
*/
router.get(
  "/student/:studentId",
  getStudentResultAnalytics
);

/*
=====================================
SUBJECT ANALYTICS
GET /api/results/analytics/subject/:subject
=====================================
*/
router.get(
  "/subject/:subject",
  getSubjectAnalytics
);

/*
=====================================
RANKING ANALYTICS
GET /api/results/analytics/rankings
=====================================
*/
router.get(
  "/rankings",
  getResultRankingAnalytics
);

/*
=====================================
TERM PERFORMANCE ANALYTICS
GET /api/results/analytics/term
=====================================
*/
router.get(
  "/term",
  getTermPerformanceAnalytics
);

export default router;