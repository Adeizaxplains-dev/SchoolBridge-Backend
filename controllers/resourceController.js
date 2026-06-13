import Resource from "../models/Resource.js";

export const createResource = async (
  req,
  res
) => {
  try {
    const resource =
      await Resource.create({
        ...req.body,
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

export const getResources = async (
  req,
  res
) => {
  try {
    const resources =
      await Resource.find({
        schoolId: req.school._id,
      });

    res.json({
      success: true,
      data: resources,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};