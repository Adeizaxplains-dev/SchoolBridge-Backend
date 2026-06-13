export const trialEngine = (req, res, next) => {
  const school = req.school;

  if (school.subscriptionPlan !== "Trial") {
    return next();
  }

  const now = new Date();

  if (now > school.trialEndsAt) {
    return res.status(403).json({
      message: "Trial expired. Please upgrade.",
      upgrade: true,
    });
  }

  next();
};