export const trialEngine = (req, res, next) => {
  try {
    const school = req.school;

    if (!school) {
      return res.status(401).json({
        success: false,
        message: "School context not found",
      });
    }

    // If no trial set → allow access
    if (!school.trialEndsAt) {
      return next();
    }

    const now = new Date();
    const trialEnd = new Date(school.trialEndsAt);

    // Trial expired check
    if (now > trialEnd) {
      return res.status(403).json({
        success: false,
        message: "Trial expired. Please upgrade your plan.",
      });
    }

    next();
  } catch (error) {
    console.error("Trial middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Trial validation failed",
    });
  }
};