import express from "express";
import {
  impersonateParent,
  stopImpersonation,
} from "../controllers/adminImpersonationController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.post(
  "/impersonate/:parentId",
  authMiddleware,
  schoolMiddleware,
  impersonateParent
);

router.post(
  "/stop-impersonation",
  authMiddleware,
  schoolMiddleware,
  stopImpersonation
);

export default router;