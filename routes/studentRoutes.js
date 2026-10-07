import express from "express";


import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,

  getStudentStats,
  getRecentStudents,

} from "../controllers/studentController.js";



import {
  authMiddleware,
} from "../middleware/authMiddleware.js";


import {
  roleGuard,
} from "../middleware/roleGuard.js";


import {
  schoolMiddleware,
} from "../middleware/schoolMiddleware.js";


import upload from "../middleware/uploads.js";



const router = express.Router();





/*
=================================================
STUDENT STATISTICS

GET /api/students/stats

Allowed:
admin
principal
=================================================
*/


router.get(
  "/stats",
  authMiddleware,
  schoolMiddleware,
  roleGuard(
    "admin",
    "principal"
  ),
  getStudentStats
);







/*
=================================================
RECENT STUDENTS

GET /api/students/recent

Dashboard widget
=================================================
*/


router.get(
  "/recent",
  authMiddleware,
  schoolMiddleware,
  roleGuard(
    "admin",
    "principal",
    "teacher"
  ),
  getRecentStudents
);







/*
=================================================
GET ALL STUDENTS

GET /api/students

Allowed:

admin
principal
teacher

=================================================
*/


router.get(
  "/",
  authMiddleware,
  schoolMiddleware,
  roleGuard(
    "admin",
    "principal",
    "teacher"
  ),
  getStudents
);







/*
=================================================
CREATE STUDENT

POST /api/students

Multipart:

passport
=================================================
*/


router.post(
  "/",
  authMiddleware,
  schoolMiddleware,
  roleGuard(
    "admin"
  ),
  upload.single(
    "passport"
  ),
  createStudent
);







/*
=================================================
GET SINGLE STUDENT

GET /api/students/:id

=================================================
*/


router.get(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleGuard(
    "admin",
    "principal",
    "teacher"
  ),
  getStudent
);







/*
=================================================
UPDATE STUDENT

PUT /api/students/:id

=================================================
*/


router.put(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleGuard(
    "admin"
  ),
  upload.single(
    "passport"
  ),
  updateStudent
);







/*
=================================================
DELETE STUDENT

DELETE /api/students/:id

=================================================
*/


router.delete(
  "/:id",
  authMiddleware,
  schoolMiddleware,
  roleGuard(
    "admin"
  ),
  deleteStudent
);







export default router;