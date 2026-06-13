import express from "express";

import upload from "../middleware/uploadMiddleware.js";

import {
  uploadStudentPassport,
  uploadAssignmentFile,
  uploadResource,
} from "../controllers/uploadController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(schoolMiddleware);

/*
=========================================
👨‍🎓 PASSPORT UPLOAD
=========================================
*/
router.post(
  "/student/:id/passport",
  upload.single("file"),
  uploadStudentPassport
);

/*
=========================================
📚 ASSIGNMENT UPLOAD
=========================================
*/
router.post(
  "/assignment",
  upload.single("file"),
  uploadAssignmentFile
);

/*
=========================================
📖 RESOURCE UPLOAD
=========================================
*/
router.post(
  "/resource",
  upload.single("file"),
  uploadResource
);

export default router;