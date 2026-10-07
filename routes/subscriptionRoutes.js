import express from "express";

import {
getSubscription,
upgradePlan,
cancelSubscription,
initializeSubscriptionPayment,
} from "../controllers/subscriptionController.js";

// Security Layer
import { authMiddleware } from "../middleware/authMiddleware.js";
import { tenantMiddleware } from "../middleware/tenantMiddleware.js";
import { trialEngine } from "../middleware/trialMiddleware.js";
import { attachContext } from "../middleware/attachContext.js";

const router = express.Router();

/*

# SECURITY STACK

*/
router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(trialEngine);
router.use(attachContext);

/*

CURRENT SUBSCRIPTION
GET /api/subscriptions
======================

*/
router.get("/", getSubscription);

/*

INITIALIZE PAYSTACK PAYMENT
POST /api/subscriptions/initialize-payment
==========================================

*/
router.post(
"/initialize-payment",
initializeSubscriptionPayment
);

/*

UPGRADE PLAN
PUT /api/subscriptions/upgrade
==============================

*/
router.put(
"/upgrade",
upgradePlan
);

/*

CANCEL SUBSCRIPTION
PUT /api/subscriptions/cancel
=============================

*/
router.put(
"/cancel",
cancelSubscription
);

export default router;
