import Student from "../models/Student.js";
import School from "../models/School.js";

/*
ADD STUDENT
*/
export const createStudent = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    // Check school plan limit
    const school = await School.findById(schoolId);

    const currentStudents = await Student.countDocuments({
      schoolId
    });

    if (currentStudents >= school.studentLimit) {
      return res.status(403).json({
        message:
          "Student limit reached. Upgrade your subscription plan."
      });
    }

    const student = await Student.create({
      ...req.body,
      schoolId
    });

    res.status(201).json(student);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
GET ALL STUDENTS
*/
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({
      schoolId: req.schoolId
    }).sort({ createdAt: -1 });

    res.json(students);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
GET ONE STUDENT
*/
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.id,
      schoolId: req.schoolId
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
UPDATE STUDENT
*/
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      {
        _id: req.params.id,
        schoolId: req.schoolId
      },
      req.body,
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
DELETE STUDENT
*/
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({
      _id: req.params.id,
      schoolId: req.schoolId
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
STUDENT DASHBOARD STATS
*/
export const getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({
      schoolId: req.schoolId
    });

    const maleStudents = await Student.countDocuments({
      schoolId: req.schoolId,
      gender: "Male"
    });

    const femaleStudents = await Student.countDocuments({
      schoolId: req.schoolId,
      gender: "Female"
    });

    res.json({
      totalStudents,
      maleStudents,
      femaleStudents
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};