// ============================================================
// backend/routes/schoolRoutes.js
// SchoolBridge Enterprise School Routes
// ============================================================

import express from "express";

import {
  getSchoolProfile,
  updateSchoolProfile,
  uploadSchoolLogo,
  getSchoolStats,
} from "../controllers/schoolController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

import {
  schoolMiddleware,
} from "../middleware/schoolMiddleware.js";

import {
  roleGuard,
} from "../middleware/roleGuard.js";

import upload from "../middleware/uploads.js";

const router = express.Router();

/*
============================================================
GLOBAL SECURITY
============================================================
*/

router.use(authMiddleware);

router.use(schoolMiddleware);

/*
============================================================
GET SCHOOL PROFILE

GET /api/schools

Roles:
- admin
- principal
- teacher
============================================================
*/

router.get(
  "/",
  roleGuard(
    "admin",
    "principal",
    "teacher"
  ),
  getSchoolProfile
);

/*
============================================================
UPDATE SCHOOL PROFILE

PUT /api/schools

Updates:
- name
- email
- phone
- address
- motto
- branding
- settings

Role:
- admin
============================================================
*/

router.put(
  "/",
  roleGuard("admin"),
  updateSchoolProfile
);

/*
============================================================
UPLOAD SCHOOL LOGO

POST /api/schools/logo

multipart/form-data

Field:
logo

Role:
admin
============================================================
*/

router.post(
  "/logo",
  roleGuard("admin"),
  upload.single("logo"),
  uploadSchoolLogo
);

/*
============================================================
SCHOOL STATISTICS

GET /api/schools/stats

Roles:
- admin
- principal
============================================================
*/

router.get(
  "/stats",
  roleGuard(
    "admin",
    "principal"
  ),
  getSchoolStats
);

/*
============================================================
EXPORT
============================================================
*/

export default router;