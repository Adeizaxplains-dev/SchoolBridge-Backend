import express from "express";

import {
  getSchoolProfile,
  updateSchoolProfile,
  getSchoolStats
} from "../controllers/schoolController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);

router.get("/", getSchoolProfile);
router.put("/", updateSchoolProfile);
router.get("/stats", getSchoolStats);

export default router;