/*
========================================
SCHOOLBRIDGE SaaS GRADE CALCULATOR
Production Ready Utility
========================================
*/

export const calculateGrade = (score) => {
  if (score >= 75) {
    return { grade: "A1", remark: "Excellent" };
  } else if (score >= 70) {
    return { grade: "B2", remark: "Very Good" };
  } else if (score >= 65) {
    return { grade: "B3", remark: "Good" };
  } else if (score >= 60) {
    return { grade: "C4", remark: "Credit" };
  } else if (score >= 55) {
    return { grade: "C5", remark: "Credit" };
  } else if (score >= 50) {
    return { grade: "C6", remark: "Credit" };
  } else if (score >= 45) {
    return { grade: "D7", remark: "Pass" };
  } else if (score >= 40) {
    return { grade: "E8", remark: "Pass" };
  } else {
    return { grade: "F9", remark: "Fail" };
  }
};

/*
========================================
TOTAL SCORE CALCULATOR (CA + EXAM)
========================================
CA1 = 10
CA2 = 10
EXAM = 70
TOTAL = 100
========================================
*/

export const calculateSubjectTotal = (ca1 = 0, ca2 = 0, exam = 0) => {
  const total = Number(ca1) + Number(ca2) + Number(exam);

  const { grade, remark } = calculateGrade(total);

  return {
    total,
    grade,
    remark,
  };
};

/*
========================================
AVERAGE CALCULATOR
========================================
*/

export const calculateAverage = (subjects = []) => {
  if (!subjects.length) return 0;

  const total = subjects.reduce(
    (sum, sub) => sum + (sub.total || 0),
    0
  );

  return Number((total / subjects.length).toFixed(2));
};

/*
========================================
PERCENTAGE CALCULATOR
========================================
*/

export const calculatePercentage = (totalScore, maxScore) => {
  if (!maxScore) return 0;

  return Number(((totalScore / maxScore) * 100).toFixed(2));
};

/*
========================================
POSITION HELPER SCORE (FOR RANKING)
========================================
*/

export const calculatePositionScore = (subjects = []) => {
  return subjects.reduce(
    (sum, sub) => sum + (sub.total || 0),
    0
  );
};