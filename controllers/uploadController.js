import {
  uploadToCloudinary,
} from "../services/cloudinaryService.js";

import Student from "../models/Student.js";
import Assignment from "../models/Assignment.js";
import Resource from "../models/Resource.js";

/*
=========================================
👨‍🎓 STUDENT PASSPORT UPLOAD
=========================================
*/
export const uploadStudentPassport =
  async (req, res) => {
    try {
      const student =
        await Student.findById(
          req.params.id
        );

      if (!student) {
        return res.status(404).json({
          message:
            "Student not found",
        });
      }

      const result =
        await uploadToCloudinary(
          req.file.path,
          "schoolbridge/students"
        );

      student.passport = result.url;
      await student.save();

      res.json({
        success: true,
        url: result.url,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

/*
=========================================
📚 ASSIGNMENT UPLOAD
=========================================
*/
export const uploadAssignmentFile =
  async (req, res) => {
    try {
      const result =
        await uploadToCloudinary(
          req.file.path,
          "schoolbridge/assignments"
        );

      const assignment =
        await Assignment.create({
          ...req.body,
          fileUrl: result.url,
          schoolId: req.school._id,
        });

      res.json({
        success: true,
        data: assignment,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

/*
=========================================
📖 RESOURCE LIBRARY UPLOAD
=========================================
*/
export const uploadResource =
  async (req, res) => {
    try {
      const result =
        await uploadToCloudinary(
          req.file.path,
          "schoolbridge/resources"
        );

      const resource =
        await Resource.create({
          ...req.body,
          fileUrl: result.url,
          schoolId: req.school._id,
        });

      res.json({
        success: true,
        data: resource,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };