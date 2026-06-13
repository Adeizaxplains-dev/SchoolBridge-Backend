import express from "express";

import {
  createFee,
  getFees,
  getFee,
  makePayment,
  getDefaulters,
  getFeeStats,
} from "../controllers/feeController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { tenantMiddleware } from "../middleware/tenantMiddleware.js";
import { trialEngine } from "../middleware/trialMiddleware.js";
import { planMiddleware } from "../middleware/planMiddleware.js";
import { attachContext } from "../middleware/attachContext.js";

const router = express.Router();

/*
  🔐 GLOBAL PROTECTION (SaaS LAYER)
*/
router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(trialEngine);
router.use(attachContext);
router.use(planMiddleware);

/*
  📊 FEE STATS
*/
router.get("/stats", getFeeStats);

/*
  🚫 DEFAULTERS
*/
router.get("/defaulters", getDefaulters);

/*
  📄 GET ALL FEES
*/
router.get("/", getFees);

/*
  ➕ CREATE FEE
*/
router.post("/", createFee);

/*
  🔍 GET SINGLE FEE
*/
router.get("/:id", getFee);

/*
  💰 RECORD PAYMENT
*/
router.put("/:id/pay", makePayment);

export default router;