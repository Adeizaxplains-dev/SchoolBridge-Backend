import express from "express";

import {
  createResult,
  getResults,
  getStudentResults
} from "../controllers/resultController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);

router.post("/", createResult);
router.get("/", getResults);
router.get("/student/:id", getStudentResults);

export default router;