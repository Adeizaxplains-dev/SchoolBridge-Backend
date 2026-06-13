import Result from "../models/Result.js";
import Student from "../models/Student.js";

/*
|--------------------------------------------------------------------------
| CREATE RESULT
|--------------------------------------------------------------------------
*/
export const createResult = async (req, res) => {
  try {
    const schoolId = req.school._id;

    const {
      studentId,
      subject,
      term,
      session,
      score,
      grade,
      remarks,
    } = req.body;

    const student = await Student.findOne({
      _id: studentId,
      school: schoolId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const result = await Result.create({
      school: schoolId,
      student: studentId,
      subject,
      term,
      session,
      score,
      grade,
      remarks,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to create result",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL RESULTS
|--------------------------------------------------------------------------
*/
export const getResults = async (req, res) => {
  try {
    const schoolId = req.school._id;

    const results = await Result.find({
      school: schoolId,
    })
      .populate(
        "student",
        "firstName lastName class"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET STUDENT RESULTS
|--------------------------------------------------------------------------
*/
export const getStudentResults = async (
  req,
  res
) => {
  try {
    const schoolId = req.school._id;

    const results = await Result.find({
      school: schoolId,
      student: req.params.id,
    }).sort({ subject: 1 });

    res.json({
      success: true,
      data: results,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student results",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE RESULT
|--------------------------------------------------------------------------
*/
export const updateResult = async (
  req,
  res
) => {
  try {
    const schoolId = req.school._id;

    const result =
      await Result.findOneAndUpdate(
        {
          _id: req.params.id,
          school: schoolId,
        },
        req.body,
        {
          new: true,
        }
      );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to update result",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE RESULT
|--------------------------------------------------------------------------
*/
export const deleteResult = async (
  req,
  res
) => {
  try {
    const schoolId = req.school._id;

    const result =
      await Result.findOneAndDelete({
        _id: req.params.id,
        school: schoolId,
      });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.json({
      success: true,
      message: "Result deleted",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to delete result",
    });
  }
};

/*
|--------------------------------------------------------------------------
| RESULT ANALYTICS
|--------------------------------------------------------------------------
*/
export const resultAnalytics = async (
  req,
  res
) => {
  try {
    const schoolId = req.school._id;

    const results = await Result.find({
      school: schoolId,
    });

    const totalResults = results.length;

    const averageScore =
      totalResults > 0
        ? (
            results.reduce(
              (sum, r) => sum + r.score,
              0
            ) / totalResults
          ).toFixed(2)
        : 0;

    const passed = results.filter(
      (r) => r.score >= 50
    ).length;

    const failed = results.filter(
      (r) => r.score < 50
    ).length;

    res.json({
      success: true,
      data: {
        totalResults,
        averageScore,
        passed,
        failed,
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Analytics error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| BULK UPLOAD RESULTS
|--------------------------------------------------------------------------
*/
export const bulkUploadResults = async (
  req,
  res
) => {
  try {
    const schoolId = req.school._id;

    const payload = req.body.results.map(
      (item) => ({
        ...item,
        school: schoolId,
        createdBy: req.user._id,
      })
    );

    const results =
      await Result.insertMany(payload);

    res.status(201).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Bulk upload failed",
    });
  }
};