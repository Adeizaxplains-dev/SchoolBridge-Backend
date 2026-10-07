import FeeStructure from "../models/FeeStructure.js";

/*
==================================================
CREATE FEE STRUCTURE
==================================================
*/

export const createFeeStructure = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const feeStructure = await FeeStructure.create({
      ...req.body,
      school,
    });

    return res.status(201).json({
      success: true,
      message: "Fee structure created successfully.",
      data: feeStructure,
    });

  } catch (error) {

    console.error("CREATE FEE STRUCTURE:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
==================================================
GET ALL FEE STRUCTURES
==================================================
*/

export const getFeeStructures = async (req, res) => {
  try {

    const school = req.school || req.school?._id;

    const feeStructures = await FeeStructure.find({
      school,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: feeStructures.length,
      data: feeStructures,
    });

  } catch (error) {

    console.error("GET FEE STRUCTURES:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
==================================================
GET SINGLE FEE STRUCTURE
==================================================
*/

export const getFeeStructure = async (req, res) => {
  try {

    const school = req.school || req.school?._id;

    const feeStructure = await FeeStructure.findOne({
      _id: req.params.id,
      school,
    });

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found.",
      });
    }

    return res.json({
      success: true,
      data: feeStructure,
    });

  } catch (error) {

    console.error("GET FEE STRUCTURE:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
==================================================
UPDATE FEE STRUCTURE
==================================================
*/

export const updateFeeStructure = async (req, res) => {
  try {

    const school = req.school || req.school?._id;

    const feeStructure =
      await FeeStructure.findOneAndUpdate(
        {
          _id: req.params.id,
          school,
        },
        req.body,
        {
           new: true,
          runValidators: true,
        }
      );

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found.",
      });
    }

    return res.json({
      success: true,
      message: "Fee structure updated successfully.",
      data: feeStructure,
    });

  } catch (error) {

    console.error("UPDATE FEE STRUCTURE:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
==================================================
DELETE FEE STRUCTURE
==================================================
*/

export const deleteFeeStructure = async (req, res) => {
  try {

    const school = req.school || req.school?._id;

    const feeStructure =
      await FeeStructure.findOneAndDelete({
        _id: req.params.id,
        school,
      });

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee structure not found.",
      });
    }

    return res.json({
      success: true,
      message: "Fee structure deleted successfully.",
    });

  } catch (error) {

    console.error("DELETE FEE STRUCTURE:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
==================================================
GET FEE STRUCTURE STATS
==================================================
*/

export const getFeeStructureStats = async (req, res) => {
  try {

    const school = req.school || req.school?._id;

    const totalStructures =
      await FeeStructure.countDocuments({
        school,
      });

    return res.json({
      success: true,
      data: {
        totalStructures,
      },
    });

  } catch (error) {

    console.error("FEE STRUCTURE STATS:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export default {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getFeeStructureStats,
};