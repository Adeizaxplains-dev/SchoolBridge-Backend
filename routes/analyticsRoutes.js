import express from "express";

import {
  getDashboardAnalytics,
  getFinancialReport,
  getRevenueAnalytics,
} from "../controllers/analyticsController.js";

import {
  getAdvancedAnalytics,
} from "../services/analyticsService.js";

import {
  getResultAnalytics,
  getClassResults,
} from "../controllers/resultController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  schoolMiddleware,
} from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
==========================================
GLOBAL MIDDLEWARE
==========================================
*/

router.use(authMiddleware);
router.use(schoolMiddleware);

/*
==========================================
DASHBOARD
GET /api/analytics/dashboard
==========================================
*/

router.get(
  "/dashboard",
  getDashboardAnalytics
);

/*
==========================================
FINANCIAL REPORT
GET /api/analytics/financial-report
==========================================
*/

router.get(
  "/financial-report",
  getFinancialReport
);

/*
==========================================
REVENUE ANALYTICS
GET /api/analytics/revenue
==========================================
*/

router.get(
  "/revenue",
  getRevenueAnalytics
);

/*
==========================================
RESULT ANALYTICS
GET /api/analytics/results
==========================================
*/

router.get(
  "/results",
  getResultAnalytics
);

/*
==========================================
CLASS RESULT ANALYTICS
GET /api/analytics/class-results
Example:
?className=JSS1&session=2025/2026&term=First
==========================================
*/

router.get(
  "/class-results",
  getClassResults
);

/*
==========================================
DEFAULTERS
==========================================
*/

router.get(
  "/defaulters",
  async (req, res) => {
    try {
      const analytics =
        await getAdvancedAnalytics(
          req.school._id
        );

      return res.json({
        success: true,
        analytics:
          analytics?.defaulters || [],
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/*
==========================================
ADVANCED ANALYTICS
==========================================
*/

router.get(
  "/advanced",
  async (req, res) => {
    try {
      const analytics =
        await getAdvancedAnalytics(
          req.school._id
        );

      return res.json({
        success: true,
        analytics,
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;