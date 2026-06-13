import express from "express";

import {
  markAttendance,
  getAttendances,
  getStudentAttendance
} from "../controllers/attendanceController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
  GLOBAL PROTECTION (SaaS MULTI-TENANT)
*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*
  MARK ATTENDANCE
*/
router.post("/", markAttendance);

/*
  GET ALL ATTENDANCE
*/
router.get("/", getAttendances);

/*
  GET STUDENT ATTENDANCE
*/
router.get("/student/:id", getStudentAttendance);

export default router;