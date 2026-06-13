import express from "express";

import {
  getSubscription,
  upgradePlan,
  cancelSubscription
} from "../controllers/subscriptionController.js";

// 🔐 SAAS MIDDLEWARE STACK
import { authMiddleware } from "../middleware/authMiddleware.js";
import { tenantMiddleware } from "../middleware/tenantMiddleware.js";
import { trialEngine } from "../middleware/trialMiddleware.js";
import { attachContext } from "../middleware/attachContext.js";

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(trialEngine);
router.use(attachContext);

router.get("/", getSubscription);
router.put("/upgrade", upgradePlan);
router.put("/cancel", cancelSubscription);

export default router;