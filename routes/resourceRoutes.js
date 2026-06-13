import express from "express";
import {
  createResource,
  getResources,
} from "../controllers/resourceController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);

router.post("/", createResource);
router.get("/", getResources);

export default router;