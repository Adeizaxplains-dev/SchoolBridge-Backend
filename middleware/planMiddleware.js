export const planMiddleware = (
  req,
  res,
  next
) => {
  try {
    const school = req.school;

    if (!school) {
      return res.status(401).json({
        success: false,
        message: "School not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Trial Validation
    |--------------------------------------------------------------------------
    */
    if (
      school.subscriptionPlan === "Trial" &&
      school.trialEndsAt
    ) {
      const now = new Date();

      if (now > new Date(school.trialEndsAt)) {
        return res.status(403).json({
          success: false,
          message:
            "Trial expired. Please upgrade your subscription.",
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Subscription Validation
    |--------------------------------------------------------------------------
    */
    if (
      school.subscriptionStatus === "expired"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Subscription expired. Please renew your plan.",
      });
    }

    if (
      school.subscriptionStatus === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "No active subscription found.",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Subscription validation failed",
    });
  }
};