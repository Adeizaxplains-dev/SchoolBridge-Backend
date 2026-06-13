import express from "express";
import { initializeSubscriptionPayment } from "../controllers/paymentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
  🔐 ALL PAYMENT ROUTES ARE PROTECTED
  - authMiddleware → verifies user login (JWT)
  - schoolMiddleware → attaches school (multi-tenant SaaS isolation)
*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*
  💳 INITIATE SUBSCRIPTION PAYMENT
  POST /api/payments/initialize
*/
router.post("/initialize", initializeSubscriptionPayment);

export default router;