import Fee from "../models/Fee.js";
import Student from "../models/Student.js";
import { getAdvancedAnalytics } from "../services/analyticsService.js";

 /*

# DASHBOARD ANALYTICS

*/
export const getDashboardAnalytics = async (req, res) => {
try {
const analytics = await getAdvancedAnalytics(
req.school
);


return res.status(200).json({
  success: true,
  analytics,
});

} catch (error) {
console.error(
"Dashboard Analytics Error:",
error
);

return res.status(500).json({
  success: false,
  message:
    "Failed to load dashboard analytics",
});

}
};

/*

# EXECUTIVE FINANCIAL REPORT

*/
export const getFinancialReport = async (
req,
res
) => {
try {
const fees = await Fee.find({
school: req.school,
}).populate(
"studentId",
"name class"
);


const totalStudents =
  await Student.countDocuments({
    school: req.school,
  });

const totalExpected = fees.reduce(
  (sum, fee) =>
    sum + (fee.amount || 0),
  0
);

const totalRevenue = fees.reduce(
  (sum, fee) =>
    sum + (fee.paidAmount || 0),
  0
);

const totalOutstanding =
  fees.reduce(
    (sum, fee) =>
      sum + (fee.balance || 0),
    0
  );

const defaulters = fees.filter(
  (fee) => fee.balance > 0
).length;

const collectionRate =
  totalExpected > 0
    ? (
        (totalRevenue /
          totalExpected) *
        100
      ).toFixed(2)
    : 0;

/*
============================
CLASS PERFORMANCE ANALYTICS
============================
*/

const classAnalytics = {};

fees.forEach((fee) => {
  const cls =
    fee.studentId?.class ||
    "Unknown";

  if (!classAnalytics[cls]) {
    classAnalytics[cls] = {
      class: cls,
      expected: 0,
      collected: 0,
      outstanding: 0,
      defaulters: 0,
      collectionRate: 0,
    };
  }

  classAnalytics[cls].expected +=
    fee.amount || 0;

  classAnalytics[cls].collected +=
    fee.paidAmount || 0;

  classAnalytics[
    cls
  ].outstanding +=
    fee.balance || 0;

  if (fee.balance > 0) {
    classAnalytics[
      cls
    ].defaulters += 1;
  }
});

const classes =
  Object.values(classAnalytics);

classes.forEach((cls) => {
  cls.collectionRate =
    cls.expected > 0
      ? Number(
          (
            (cls.collected /
              cls.expected) *
            100
          ).toFixed(2)
        )
      : 0;
});

/*
============================
TOP PERFORMING CLASS
============================
*/

const bestClass =
  classes.length > 0
    ? [...classes].sort(
        (a, b) =>
          b.collectionRate -
          a.collectionRate
      )[0]
    : null;

const worstClass =
  classes.length > 0
    ? [...classes].sort(
        (a, b) =>
          a.collectionRate -
          b.collectionRate
      )[0]
    : null;

/*
============================
CHART DATA
============================
*/

const revenueChart =
  classes.map((c) => ({
    class: c.class,
    revenue: c.collected,
  }));

const outstandingChart =
  classes.map((c) => ({
    class: c.class,
    outstanding:
      c.outstanding,
  }));

const defaultersChart =
  classes.map((c) => ({
    class: c.class,
    defaulters:
      c.defaulters,
  }));

/*
============================
FEE STATUS BREAKDOWN
============================
*/

const paidFees = fees.filter(
  (fee) =>
    fee.status === "paid"
).length;

const partialFees =
  fees.filter(
    (fee) =>
      fee.status ===
      "partial"
  ).length;

const unpaidFees = fees.filter(
  (fee) =>
    fee.status ===
    "unpaid"
).length;

/*
============================
RESPONSE
============================
*/

return res.status(200).json({
  success: true,

  report: {
    totalStudents,

    totalExpected,

    totalRevenue,

    totalOutstanding,

    defaulters,

    collectionRate:
      Number(collectionRate),

    paidFees,

    partialFees,

    unpaidFees,

    bestClass,

    worstClass,
  },

  charts: {
    revenueChart,
    outstandingChart,
    defaultersChart,
  },

  classes,
});

} catch (error) {
console.error(
"Financial Report Error:",
error
);


return res.status(500).json({
  success: false,
  message:
    "Failed to load financial report",
});


}
};

 /*

# REVENUE ANALYTICS

*/
export const getRevenueAnalytics =
async (req, res) => {
try {
const fees =
await Fee.find({
school:
req.school,
});


  const revenue =
    fees.reduce(
      (sum, fee) =>
        sum +
        (fee.paidAmount ||
          0),
      0
    );

  const outstanding =
    fees.reduce(
      (sum, fee) =>
        sum +
        (fee.balance ||
          0),
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

  return res.json({
    success: true,

    analytics: {
      revenue,

      outstanding,

      paidFees,

      partialFees,

      unpaidFees,
    },
  });
} catch (error) {
  console.error(
    "Revenue Analytics Error:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Failed to load revenue analytics",
  });
}
};