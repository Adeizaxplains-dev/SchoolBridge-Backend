import express from "express";


import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherStats,

  suspendTeacher,
  activateTeacher,

  assignClasses,
  assignSubjects,

  getTeacherSchedule,
  addTeacherSchedule,
  removeTeacherSchedule,

  getTeacherAttendance,
  getTeacherPerformance,

  importTeachers,
  exportTeachers,

} from "../controllers/teacherController.js";



import {
  authMiddleware,
} from "../middleware/authMiddleware.js";


import {
  roleGuard,
} from "../middleware/roleGuard.js";


import upload from "../middleware/uploads.js";



const router = express.Router();





/*
================================================
TEACHER MANAGEMENT
================================================
*/


/*
================================================
GET ALL TEACHERS

GET /api/teachers

Allowed:
- admin
- principal
- HR
================================================
*/

router.get(
  "/",
  authMiddleware,
  roleGuard(
    "admin",
    "principal",
    "hr"
  ),
  getTeachers
);







/*
================================================
GET TEACHER STATISTICS

GET /api/teachers/stats
================================================
*/

router.get(
  "/stats",
  authMiddleware,
  roleGuard(
    "admin",
    "principal"
  ),
  getTeacherStats
);







/*
================================================
CREATE TEACHER

POST /api/teachers

Multipart:
photo
================================================
*/

router.post(
  "/",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  upload.single("photo"),
  createTeacher
);







/*
================================================
IMPORT TEACHERS

POST /api/teachers/import
================================================
*/

router.post(
  "/import",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  upload.single("file"),
  importTeachers
);







/*
================================================
EXPORT TEACHERS

GET /api/teachers/export
================================================
*/

router.get(
  "/export",
  authMiddleware,
  roleGuard(
    "admin",
    "principal"
  ),
  exportTeachers
);








/*
================================================
GET SINGLE TEACHER

GET /api/teachers/:id

KEEP BELOW STATIC ROUTES
================================================
*/

router.get(
  "/:id",
  authMiddleware,
  roleGuard(
    "admin",
    "principal",
    "teacher"
  ),
  getTeacher
);








/*
================================================
UPDATE TEACHER

PUT /api/teachers/:id
================================================
*/

router.put(
  "/:id",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  upload.single("photo"),
  updateTeacher
);








/*
================================================
DELETE TEACHER

DELETE /api/teachers/:id
================================================
*/

router.delete(
  "/:id",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  deleteTeacher
);








/*
================================================
SUSPEND TEACHER

PATCH /api/teachers/:id/suspend
================================================
*/

router.patch(
  "/:id/suspend",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  suspendTeacher
);








/*
================================================
ACTIVATE TEACHER

PATCH /api/teachers/:id/activate
================================================
*/

router.patch(
  "/:id/activate",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  activateTeacher
);








/*
================================================
ASSIGN CLASSES

PATCH /api/teachers/:id/classes
================================================
*/

router.patch(
  "/:id/classes",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  assignClasses
);








/*
================================================
ASSIGN SUBJECTS

PATCH /api/teachers/:id/subjects
================================================
*/

router.patch(
  "/:id/subjects",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  assignSubjects
);








/*
================================================
TEACHER SCHEDULE

GET
POST
DELETE

/api/teachers/:id/schedule
================================================
*/


router.get(
  "/:id/schedule",
  authMiddleware,
  roleGuard(
    "admin",
    "teacher"
  ),
  getTeacherSchedule
);



router.post(
  "/:id/schedule",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  addTeacherSchedule
);



router.delete(
  "/:id/schedule/:scheduleId",
  authMiddleware,
  roleGuard(
    "admin"
  ),
  removeTeacherSchedule
);








/*
================================================
TEACHER ATTENDANCE

GET /api/teachers/:id/attendance
================================================
*/

router.get(
  "/:id/attendance",
  authMiddleware,
  roleGuard(
    "admin",
    "teacher"
  ),
  getTeacherAttendance
);








/*
================================================
TEACHER PERFORMANCE

GET /api/teachers/:id/performance
================================================
*/

router.get(
  "/:id/performance",
  authMiddleware,
  roleGuard(
    "admin",
    "principal"
  ),
  getTeacherPerformance
);







export default router;