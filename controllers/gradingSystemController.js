import GradingSystem from "../models/GradingSystem.js";

/*
==================================================
CREATE GRADING SYSTEM
POST /api/grading-system
==================================================
*/

export const createGradingSystem = async (req, res) => {
  try {
    const school = req.school._id;

    const gradingSystem = await GradingSystem.create({
      ...req.body,
      school,
    });

    return res.status(201).json({
      success: true,
      message: "Grading system created successfully.",
      data: gradingSystem,
    });
  } catch (error) {
    console.error("CREATE GRADING SYSTEM:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
GET ALL GRADING SYSTEMS
GET /api/grading-system
==================================================
*/

export const getGradingSystems = async (req, res) => {
  try {
    const gradingSystems = await GradingSystem.find({
      school: req.school._id,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: gradingSystems.length,
      data: gradingSystems,
    });
  } catch (error) {
    console.error("GET GRADING SYSTEMS:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
GET SINGLE GRADING SYSTEM
GET /api/grading-system/:id
==================================================
*/

export const getGradingSystem = async (req, res) => {
  try {
    const gradingSystem = await GradingSystem.findOne({
      _id: req.params.id,
      school: req.school._id,
    });

    if (!gradingSystem) {
      return res.status(404).json({
        success: false,
     message: "Grading system not found.",
      });
    }

    return res.json({
      success: true,
      data: gradingSystem,
    });
  } catch (error) {
    console.error("GET GRADING SYSTEM:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
UPDATE GRADING SYSTEM
PUT /api/grading-system/:id
==================================================
*/

export const updateGradingSystem = async (req, res) => {
  try {
    const gradingSystem =
      await GradingSystem.findOneAndUpdate(
        {
          _id: req.params.id,
          school: req.school._id,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!gradingSystem) {
      return res.status(404).json({
        success: false,
        message: "Grading system not found.",
      });
    }

    return res.json({
      success: true,
      message: "Grading system updated successfully.",
      data: gradingSystem,
    });
  } catch (error) {
    console.error("UPDATE GRADING SYSTEM:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
DELETE GRADING SYSTEM
DELETE /api/grading-system/:id
==================================================
*/

export const deleteGradingSystem = async (req, res) => {
  try {
    const gradingSystem =
      await GradingSystem.findOneAndDelete({
        _id: req.params.id,
        school: req.school._id,
      });

    if (!gradingSystem) {
      return res.status(404).json({
        success: false,
        message: "Grading system not found.",
      });
    }

    return res.json({
      success: true,
      message: "Grading system deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE GRADING SYSTEM:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
====================================================
SET DEFAULT ("current") GRADING SYSTEM
PATCH /api/grading-systems/:id/current

Exactly one grading system per school is the default.
====================================================
*/

export const setCurrentGradingSystem = async (req, res) => {
  try {
    const school = req.school?._id || req.schoolId || req.user?.school?._id || req.user?.school;

    const target = await GradingSystem.findOne({
      _id: req.params.id,
      school,
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Grading system not found.",
      });
    }

    await GradingSystem.updateMany(
      { school, _id: { $ne: target._id } },
      { $set: { isDefault: false } }
    );

    target.isDefault = true;
    await target.save();

    return res.status(200).json({
      success: true,
      message: "Default grading system updated.",
      data: target,
    });
  } catch (error) {
    console.error("SET CURRENT GRADING SYSTEM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update default grading system.",
    });
  }
};
