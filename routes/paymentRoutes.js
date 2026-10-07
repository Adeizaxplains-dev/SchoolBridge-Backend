import express from "express";

import {
  recordPayment,
  getPayments,
  initializePayment,
} from "../controllers/paymentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
=====================================
MANUAL PAYMENTS
=====================================
*/

// Record payment
router.post(
  "/",
  authMiddleware,
  schoolMiddleware,
  recordPayment
);

// Get all payments
router.get(
  "/",
  authMiddleware,
  schoolMiddleware,
  getPayments
);

/*
=====================================
PAYSTACK SUBSCRIPTION PAYMENT
=====================================
*/

// Initialize Paystack transaction
router.post(
  "/initialize",
  authMiddleware,
  schoolMiddleware,
  initializePayment
);

export default router;