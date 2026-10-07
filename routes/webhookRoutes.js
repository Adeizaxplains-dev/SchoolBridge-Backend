import express from "express";
import { paystackWebhook } from "../controllers/webhookController.js";

const router = express.Router();

/*
========================================
PAYSTACK WEBHOOK ROUTE
- No auth middleware (Paystack calls it)
- Must be public endpoint
========================================
*/
router.post("/paystack", paystackWebhook);

export default router;