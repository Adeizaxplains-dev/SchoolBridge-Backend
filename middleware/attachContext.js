export const attachContext = (req, res, next) => {
  req.context = {
    schoolId: req.school?._id,
    schoolName: req.school?.name,
    plan: req.school?.subscriptionPlan,
    userId: req.user?._id,
    role: req.user?.role,
  };

  next();
};