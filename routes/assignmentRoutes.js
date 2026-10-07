import express from "express";

import {
  createAssignment,
  getAssignments,
  submitAssignment,
  getSubmissions,
} from "../controllers/assignmentController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);

router.post("/", createAssignment);
router.get("/", getAssignments);

router.post(
  "/submit",
  submitAssignment
);

router.get(
  "/submissions",
  getSubmissions
);

export default router;