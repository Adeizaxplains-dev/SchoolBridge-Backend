import express from "express";
import { paystackWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// IMPORTANT: no auth middleware here
router.post("/paystack", paystackWebhook);

export default router;