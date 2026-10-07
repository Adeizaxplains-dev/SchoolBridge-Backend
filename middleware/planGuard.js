export const planGuard = (feature) => {
  return (req, res, next) => {
    const school = req.school;

    const limits = {
      Trial: {
        students: 100,
        messages: 200,
        automation: false,
      },
      Starter: {
        students: 300,
        messages: 1000,
        automation: true,
      },
      Growth: {
        students: 1000,
        messages: 5000,
        automation: true,
      },
    };

    const plan = limits[school.subscriptionPlan];

    if (!plan) {
      return res.status(403).json({
        message: "Invalid subscription",
      });
    }

    if (feature === "automation" && !plan.automation) {
      return res.status(403).json({
        message: "Upgrade required for automation",
      });
    }

    req.plan = plan; // attach limits

    next();
  };
};