import express from "express";

import {
  createParent,
  getParents,
  getParent,
} from "../controllers/parentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);

router.post("/", createParent);
router.get("/", getParents);
router.get("/:id", getParent);

export default router;