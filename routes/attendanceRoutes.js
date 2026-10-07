import express from "express";

import {
  markAttendance,
  getAttendances,
  getStudentAttendance,
  getAttendanceStats,
  getClassAttendance,
} from "../controllers/attendanceController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
=================================
MIDDLEWARE
=================================
*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*
=================================
ATTENDANCE ANALYTICS
=================================
*/
router.get("/stats", getAttendanceStats);

router.get(
  "/class/:className",
  getClassAttendance
);

/*
=================================
MARK ATTENDANCE
=================================
*/
router.post("/", markAttendance);

/*
=================================
GET ALL ATTENDANCE
=================================
*/
router.get("/", getAttendances);

/*
=================================
GET STUDENT ATTENDANCE
=================================
*/
router.get(
  "/student/:id",
  getStudentAttendance
);

export default router;