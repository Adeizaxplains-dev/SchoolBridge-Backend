import Parent from "../models/Parent.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Result from "../models/Result.js";
import Message from "../models/Message.js";
import Fee from "../models/Fee.js";

/*
=========================================
PARENT DASHBOARD
=========================================
*/
export const getParentDashboard = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        children: 0,
        outstandingFees: 0,
        resultsAvailable: 0,
        unreadMessages: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
GET CHILDREN
=========================================
*/
export const getParentChildren = async (req, res) => {
  try {
    const children = await Student.find();

    res.json({
      success: true,
      data: children,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
GET FEES
=========================================
*/
export const getParentFees = async (req, res) => {
  try {
    const fees = await Fee.find();

    res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
GET ATTENDANCE
=========================================
*/
export const getParentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find();

    res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
GET RESULTS
=========================================
*/
export const getParentResults = async (req, res) => {
  try {
    const results = await Result.find();

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
GET MESSAGES
=========================================
*/
export const getParentMessages = async (req, res) => {
  try {
    const messages = await Message.find();

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};