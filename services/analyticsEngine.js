import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import Subscription from "../models/Subscription.js";
import School from "../models/School.js";
import Attendance from "../models/Attendance.js";

export const analyticsEngine = async (
school
) => {
try {
/*
=====================================
SCHOOL
=====================================
*/
const schoolDoc =
  await School.findById(
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

const maleStudents =
  await Student.countDocuments({
    school,
    gender: "Male",
  });

const femaleStudents =
  await Student.countDocuments({
    school,
    gender: "Female",
  });

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

const paidFees =
  fees.filter(
    (fee) =>
      fee.status ===
      "paid"
  ).length;

const partialFees =
  fees.filter(
    (fee) =>
      fee.status ===
      "partial"
  ).length;

const unpaidFees =
  fees.filter(
    (fee) =>
      fee.status ===
      "unpaid"
  ).length;

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

const totalLate =
  await Attendance.countDocuments(
    {
      school:
        school,
      status: "Late",
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
CLASS PERFORMANCE
=====================================
*/
const classMap = {};

fees.forEach((fee) => {
  const cls =
    fee.studentId
      ?.class ||
    "Unknown";

  if (!classMap[cls]) {
    classMap[cls] = {
      class: cls,
      expected: 0,
      revenue: 0,
      outstanding: 0,
    };
  }

  classMap[
    cls
  ].expected +=
    fee.amount || 0;

  classMap[
    cls
  ].revenue +=
    fee.paidAmount || 0;

  classMap[
    cls
  ].outstanding +=
    fee.balance || 0;
});

const classPerformance =
  Object.values(
    classMap
  ).map((c) => ({
    ...c,
    collectionRate:
      c.expected > 0
        ? Number(
            (
              (c.revenue /
                c.expected) *
              100
            ).toFixed(2)
          )
        : 0,
  }));

/*
=====================================
SUBSCRIPTION
=====================================
*/
const subscription =
  await Subscription.findOne(
    {
      school,
    }
  );

const maxStudents =
  subscription
    ?.maxStudents ||
  schoolDoc?.studentLimit ||
  50;

const usagePercent =
  Number(
    (
      (totalStudents /
        maxStudents) *
      100
    ).toFixed(2)
  );

/*
=====================================
CHARTS
=====================================
*/
const revenueChart =
  classPerformance.map(
    (c) => ({
      class:
        c.class,
      revenue:
        c.revenue,
    })
  );

const collectionChart =
  classPerformance.map(
    (c) => ({
      class:
        c.class,
      collectionRate:
        c.collectionRate,
    })
  );

/*
=====================================
EXECUTIVE SCORE
=====================================
*/

const healthScore =
  Math.round(
    (
      collectionRate *
        0.6 +
      attendanceRate *
        0.4
    )
  );

/*
=====================================
RESPONSE
=====================================
*/

return {
  schoolName:
    schoolDoc?.name ||
    "School",

  totalStudents,
  maleStudents,
  femaleStudents,

  totalExpected,
  totalRevenue,
  totalOutstanding,

  paidFees,
  partialFees,
  unpaidFees,
  defaulters,

  collectionRate,

  totalAttendance,
  totalPresent,
  totalAbsent,
  totalLate,

  attendanceRate,

  classPerformance,

  revenueChart,
  collectionChart,

  subscription:
    subscription
      ?.plan ||
    "Trial",

  subscriptionStatus:
    subscription
      ?.status ||
    "inactive",

  maxStudents,
  usagePercent,

  healthScore,

  generatedAt:
    new Date(),
};

} catch (error) {
console.error(
"ANALYTICS ENGINE ERROR:",
error
);

throw error;

}
};
