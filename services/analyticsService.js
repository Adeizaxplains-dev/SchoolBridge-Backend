import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import Attendance from "../models/Attendance.js";
import School from "../models/School.js";

import { analyticsEngine } from "./analyticsEngine.js";

 /*

# ADVANCED ANALYTICS SERVICE

*/
export const getAdvancedAnalytics = async (
school
) => {
try {
/*
=====================================
BASE ANALYTICS ENGINE
=====================================
*/
const analytics =
await analyticsEngine(
school
);

/*
=====================================
STUDENTS
=====================================
*/
const totalStudents =
  await Student.countDocuments({
    school,
  });

const schoolDoc =
  await School.findById(
    school
  );

const maxStudents =
  schoolDoc?.studentLimit ||
  1;

const usagePercent =
  (
    (totalStudents /
      maxStudents) *
    100
  ).toFixed(2);

/*
=====================================
FEES
=====================================
*/
const fees =
  await Fee.find({
    school,
  }).populate(
    "studentId",
    "class"
  );

const totalExpected =
  fees.reduce(
    (sum, fee) =>
      sum +
      (fee.amount || 0),
    0
  );

const totalRevenue =
  fees.reduce(
    (sum, fee) =>
      sum +
      (fee.paidAmount ||
        0),
    0
  );

const totalOutstanding =
  fees.reduce(
    (sum, fee) =>
      sum +
      (fee.balance || 0),
    0
  );

const defaulters =
  fees.filter(
    (fee) =>
      fee.balance > 0
  ).length;

const collectionRate =
  totalExpected > 0
    ? Number(
        (
          (totalRevenue /
            totalExpected) *
          100
        ).toFixed(2)
      )
    : 0;

/*
=====================================
CLASS PERFORMANCE
=====================================
*/
const classPerformance =
  {};

fees.forEach((fee) => {
  const cls =
    fee.studentId?.class ||
    "Unknown";

  if (
    !classPerformance[
      cls
    ]
  ) {
    classPerformance[
      cls
    ] = {
      class: cls,
      expected: 0,
      revenue: 0,
      outstanding: 0,
      collectionRate: 0,
    };
  }

  classPerformance[
    cls
  ].expected +=
    fee.amount || 0;

  classPerformance[
    cls
  ].revenue +=
    fee.paidAmount || 0;

  classPerformance[
    cls
  ].outstanding +=
    fee.balance || 0;
});

Object.values(
  classPerformance
).forEach((item) => {
  item.collectionRate =
    item.expected > 0
      ? Number(
          (
            (item.revenue /
              item.expected) *
            100
          ).toFixed(2)
        )
      : 0;
});

const classAnalytics =
  Object.values(
    classPerformance
  );

/*
=====================================
ATTENDANCE
=====================================
*/
const totalAttendance =
  await Attendance.countDocuments(
    {
      school:
        school,
    }
  );

const totalPresent =
  await Attendance.countDocuments(
    {
      school:
        school,
      status:
        "Present",
    }
  );

const totalAbsent =
  await Attendance.countDocuments(
    {
      school:
        school,
      status:
        "Absent",
    }
  );

const attendanceRate =
  totalAttendance > 0
    ? Number(
        (
          (totalPresent /
            totalAttendance) *
          100
        ).toFixed(2)
      )
    : 0;

/*
=====================================
CHART DATA
=====================================
*/

const revenueChart =
  classAnalytics.map(
    (c) => ({
      class:
        c.class,
      revenue:
        c.revenue,
    })
  );

const outstandingChart =
  classAnalytics.map(
    (c) => ({
      class:
        c.class,
      outstanding:
        c.outstanding,
    })
  );

/*
=====================================
EXECUTIVE SUMMARY
=====================================
*/

return {
  ...analytics,

  /*
  Students
  */
  totalStudents,
  maxStudents,
  usagePercent:
    Number(
      usagePercent
    ),

  /*
  Finance
  */
  totalExpected,
  totalRevenue,
  totalOutstanding,
  defaulters,
  collectionRate,

  /*
  Attendance
  */
  totalAttendance,
  totalPresent,
  totalAbsent,
  attendanceRate,

  /*
  Charts
  */
  revenueChart,
  outstandingChart,

  /*
  Class Analytics
  */
  classAnalytics,

  /*
  Subscription
  */
  subscriptionPlan:
    schoolDoc?.subscriptionPlan ||
    "Free",

  schoolName:
    schoolDoc?.name ||
    "",

  generatedAt:
    new Date(),
};

} catch (error) {
console.error(
"ANALYTICS SERVICE ERROR:",
error
);

return {
  totalStudents: 0,
  maxStudents: 0,
  usagePercent: 0,

  totalExpected: 0,
  totalRevenue: 0,
  totalOutstanding: 0,
  defaulters: 0,
  collectionRate: 0,

  totalAttendance: 0,
  totalPresent: 0,
  totalAbsent: 0,
  attendanceRate: 0,

  revenueChart: [],
  outstandingChart: [],
  classAnalytics: [],

  subscriptionPlan:
    "Free",
};

}
};
