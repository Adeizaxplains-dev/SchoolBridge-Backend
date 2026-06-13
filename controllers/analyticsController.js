import { getAdvancedAnalytics } from "../services/analyticsService.js";

export const getDashboardAnalytics = async (
  req,
  res
) => {
  try {
    const analytics =
      await getAdvancedAnalytics(
        req.school._id
      );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error(
      "Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard analytics",
    });
  }
};