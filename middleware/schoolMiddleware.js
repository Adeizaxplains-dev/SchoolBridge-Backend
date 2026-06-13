export const schoolMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    req.schoolId = req.user.schoolId;

    next();

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};