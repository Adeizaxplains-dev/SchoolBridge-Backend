import express from "express";

import {
  getTeacherDashboard,
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherClasses,
  getTeacherStudents,
  getTeacherSubjects,
  getTeacherAttendance,
  markAttendance,
  getTeacherResults,
  saveResult,
  publishResult,
  getTeacherAssignments,
  createAssignment,
  getTeacherMessages,
} from "../controllers/teacherPortalController.js";

import {
  authMiddleware,
  teacherOnly,
} from "../middleware/authMiddleware.js";

import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*
==================================================
TEACHER PORTAL ROUTES
==================================================
*/

router.use(authMiddleware);
router.use(teacherOnly);
router.use(schoolMiddleware);

/*
==================================================
DASHBOARD
==================================================
*/

// GET /api/teacher/dashboard
router.get(
  "/dashboard",
  getTeacherDashboard
);

/*
==================================================
PROFILE
==================================================
*/

// GET /api/teacher/profile
router.get(
  "/profile",
  getTeacherProfile
);

// PUT /api/teacher/profile
router.put(
  "/profile",
  updateTeacherProfile
);

/*
==================================================
CLASSES
==================================================
*/

// GET /api/teacher/classes
router.get(
  "/classes",
  getTeacherClasses
);

/*
==================================================
SUBJECTS
==================================================
*/

// GET /api/teacher/subjects
router.get(
  "/subjects",
  getTeacherSubjects
);

/*
==================================================
STUDENTS
==================================================
*/

// GET /api/teacher/students
router.get(
  "/students",
  getTeacherStudents
);

/*
==================================================
ATTENDANCE
==================================================
*/

// GET /api/teacher/attendance
router.get(
  "/attendance",
  getTeacherAttendance
);

// POST /api/teacher/attendance
router.post(
  "/attendance",
  markAttendance
);

/*
==================================================
RESULTS
==================================================
*/

// GET /api/teacher/results
router.get(
  "/results",
  getTeacherResults
);

// POST /api/teacher/results
router.post(
  "/results",
  saveResult
);

// PUT /api/teacher/results/publish
router.put(
  "/results/publish",
  publishResult
);

/*
==================================================
ASSIGNMENTS
==================================================
*/

// GET /api/teacher/assignments
router.get(
  "/assignments",
  getTeacherAssignments
);

// POST /api/teacher/assignments
router.post(
  "/assignments",
  createAssignment
);

/*
==================================================
MESSAGES
==================================================
*/

// GET /api/teacher/messages
router.get(
  "/messages",
  getTeacherMessages
);

export default router;