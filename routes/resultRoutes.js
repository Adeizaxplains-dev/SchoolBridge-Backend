import express from "express";

import {
  getResults,
  getResultById,
  getClassResults,
  getStudentResults,
  createResult,
  updateResult,
  deleteResult,
} from "../controllers/resultController.js";

import {
  approveResult,
  publishResult,
  generatePDF,
  sendResultToParent,
} from "../controllers/resultPublishController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
=====================================
SAAS SECURITY LAYER
=====================================
*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*
=====================================
CREATE RESULT
=====================================
*/
router.post("/", createResult);

/*
=====================================
GET ALL RESULTS
=====================================
*/
router.get("/", getResults);

/*
=====================================
GET STUDENT RESULTS
=====================================
*/
router.get("/student/:id", getStudentResults);

/*
=====================================
GET CLASS RESULTS
=====================================
*/
router.get("/class/:className", getClassResults);

/*
=====================================
GENERATE PDF
=====================================
*/
router.get("/pdf/:id", generatePDF);

/*
=====================================
SEND RESULT TO PARENT
=====================================
*/
router.post("/send/:id", sendResultToParent);

/*
=====================================
APPROVE RESULT
=====================================
*/
router.patch("/approve/:id", approveResult);

/*
=====================================
PUBLISH RESULT
=====================================
*/
router.patch("/publish/:id", publishResult);

/*
=====================================
UPDATE RESULT
=====================================
*/
router.put("/:id", updateResult);

/*
=====================================
DELETE RESULT
=====================================
*/
router.delete("/:id", deleteResult);

/*
=====================================
GET SINGLE RESULT
=====================================
IMPORTANT:
Keep this LAST so it doesn't catch
/pdf/:id, /approve/:id, etc.
=====================================
*/
router.get("/:id", getResultById);

export default router;