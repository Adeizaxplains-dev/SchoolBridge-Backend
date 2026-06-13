import Parent from "../models/Parent.js";

export const createParent = async (req, res) => {
  try {
    const schoolId = req.school._id;

    const parent = await Parent.create({
      ...req.body,
      school: schoolId,
    });

    res.status(201).json({
      success: true,
      data: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getParents = async (req, res) => {
  try {
    const parents = await Parent.find({
      school: req.school._id,
    }).populate("children");

    res.json({
      success: true,
      data: parents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getParent = async (req, res) => {
  try {
    const parent = await Parent.findById(
      req.params.id
    ).populate("children");

    res.json({
      success: true,
      data: parent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};