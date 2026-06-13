import Attendance from "../models/Attendance.js";

/*
  MARK / CREATE ATTENDANCE
*/
export const markAttendance = async (req, res) => {
  try {
    const schoolId = req.school._id;

    const attendance = await Attendance.create({
      ...req.body,
      school: schoolId,
    });

    res.status(201).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
};

/*
  GET ALL ATTENDANCE (SCHOOL LEVEL)
*/
export const getAttendances = async (req, res) => {
  try {
    const schoolId = req.school._id;

    const records = await Attendance.find({ school: schoolId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

/*
  GET SINGLE STUDENT ATTENDANCE
*/
export const getStudentAttendance = async (req, res) => {
  try {
    const schoolId = req.school._id;
    const studentId = req.params.id;

    const records = await Attendance.find({
      school: schoolId,
      student: studentId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: records,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student attendance",
    });
  }
};