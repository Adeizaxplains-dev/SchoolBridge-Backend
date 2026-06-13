import { analyticsEngine } from "./analyticsEngine.js";

export const getAdvancedAnalytics = async (
  schoolId
) => {
  const analytics =
    await analyticsEngine(schoolId);

  const usagePercent =
    (analytics.totalStudents /
      analytics.maxStudents) *
    100;

  return {
    ...analytics,
    usagePercent,
  };
};