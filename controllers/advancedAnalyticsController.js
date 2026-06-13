import { analyticsEngine } from "../services/analyticsEngine.js";
import { billingEngine } from "../services/billingEngine.js";
import { usageEngine } from "../services/usageEngine.js";
import { automationEngine } from "../services/automationEngine.js";

import Fee from "../models/Fee.js";
import Student from "../models/Student.js";
import Subscription from "../models/Subscription.js";

export const getAdvancedAnalytics = async (
  req,
  res
) => {
  try {
    const schoolId = req.school._id;

    /*
    |--------------------------------------------------------------------------
    | CORE ANALYTICS ENGINE
    |--------------------------------------------------------------------------
    */
    const analytics =
      await analyticsEngine(schoolId);

    /*
    |--------------------------------------------------------------------------
    | SUBSCRIPTION
    |--------------------------------------------------------------------------
    */
    const subscription =
      await Subscription.findOne({
        school: schoolId,
      });

    /*
    |--------------------------------------------------------------------------
    | USAGE ENGINE
    |--------------------------------------------------------------------------
    */
    const usage =
      await usageEngine(
        schoolId,
        subscription
      );

    /*
    |--------------------------------------------------------------------------
    | BILLING ENGINE
    |--------------------------------------------------------------------------
    */
    const billing =
      await billingEngine(schoolId);

    /*
    |--------------------------------------------------------------------------
    | AUTOMATION ENGINE
    |--------------------------------------------------------------------------
    */
    const automation =
      await automationEngine(schoolId);

    /*
    |--------------------------------------------------------------------------
    | STUDENT GROWTH
    |--------------------------------------------------------------------------
    */
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const startOfLastMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() - 1,
      1
    );

    const thisMonthStudents =
      await Student.countDocuments({
        school: schoolId,
        createdAt: {
          $gte: startOfMonth,
        },
      });

    const lastMonthStudents =
      await Student.countDocuments({
        school: schoolId,
        createdAt: {
          $gte: startOfLastMonth,
          $lt: startOfMonth,
        },
      });

    const studentGrowth =
      lastMonthStudents === 0
        ? 100
        : (
            ((thisMonthStudents -
              lastMonthStudents) /
              lastMonthStudents) *
            100
          ).toFixed(2);

    /*
    |--------------------------------------------------------------------------
    | MONTHLY REVENUE TREND
    |--------------------------------------------------------------------------
    */
    const revenueTrend =
      await Fee.aggregate([
        {
          $match: {
            school: schoolId,
          },
        },
        {
          $group: {
            _id: {
              month: {
                $month: "$createdAt",
              },
            },
            totalRevenue: {
              $sum: "$paidAmount",
            },
          },
        },
        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

    /*
    |--------------------------------------------------------------------------
    | RECENT ACTIVITY
    |--------------------------------------------------------------------------
    */
    const recentActivity =
      await Fee.find({
        school: schoolId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(5);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */
    res.status(200).json({
      success: true,

      analytics,

      billing,

      usage,

      automation,

      growth: {
        studentGrowth,
      },

      revenueTrend,

      recentActivity,
    });
  } catch (error) {
    console.error(
      "Advanced Analytics Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load advanced analytics",
    });
  }
};