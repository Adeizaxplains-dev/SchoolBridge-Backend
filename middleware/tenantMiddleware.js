import School from "../models/School.js";

/*
This ensures EVERY request belongs to a school
*/
export const tenantMiddleware = async (req, res, next) => {
  try {
    const schoolId =
      req.user?.school || req.headers["x-school-id"];

    if (!schoolId) {
      return res.status(401).json({
        message: "School context missing",
      });
    }

    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({
        message: "School not found",
      });
    }

    req.school = school; // 🔥 inject tenant globally

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};