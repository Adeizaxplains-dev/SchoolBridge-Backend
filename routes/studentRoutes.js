import express from "express";
import Student from "../models/Student.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, schoolMiddleware, async (req, res) => {
  const students = await Student.find({ schoolId: req.schoolId });
  res.json(students);
});

router.post("/", authMiddleware, schoolMiddleware, async (req, res) => {
  const student = await Student.create({
    ...req.body,
    schoolId: req.schoolId
  });

  res.json(student);
});

export default router;