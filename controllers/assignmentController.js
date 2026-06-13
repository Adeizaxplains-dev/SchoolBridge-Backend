import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";

/* CREATE ASSIGNMENT */
export const createAssignment = async (
  req,
  res
) => {
  try {
    const assignment =
      await Assignment.create({
        ...req.body,
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

/* GET ASSIGNMENTS */
export const getAssignments = async (
  req,
  res
) => {
  try {
    const assignments =
      await Assignment.find({
        schoolId: req.school._id,
      });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* SUBMIT ASSIGNMENT */
export const submitAssignment = async (
  req,
  res
) => {
  try {
    const submission =
      await Submission.create({
        ...req.body,
        schoolId: req.school._id,
      });

    res.json({
      success: true,
      data: submission,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* GET SUBMISSIONS */
export const getSubmissions = async (
  req,
  res
) => {
  try {
    const submissions =
      await Submission.find({
        schoolId: req.school._id,
      }).populate("student assignment");

    res.json({
      success: true,
      data: submissions,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};