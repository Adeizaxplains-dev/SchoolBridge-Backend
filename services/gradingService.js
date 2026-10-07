 /*
=====================================================
SCHOOLBRIDGE SAAS GRADING ENGINE (PRODUCTION LEVEL)
=====================================================
Supports:
- WAEC / NECO style grading
- Custom SaaS extensibility
- AI-ready remark system
=====================================================
*/

/*
=====================================
GRADE SCALE CONFIGURATION
=====================================
*/
const gradeScale = [
  { min: 75, max: 100, grade: "A1", remark: "Excellent performance" },
  { min: 70, max: 74, grade: "B2", remark: "Very Good performance" },
  { min: 65, max: 69, grade: "B3", remark: "Good performance" },
  { min: 60, max: 64, grade: "C4", remark: "Credit level performance" },
  { min: 55, max: 59, grade: "C5", remark: "Credit level performance" },
  { min: 50, max: 54, grade: "C6", remark: "Credit level performance" },
  { min: 45, max: 49, grade: "D7", remark: "Pass - weak performance" },
  { min: 40, max: 44, grade: "E8", remark: "Poor performance" },
  { min: 0, max: 39, grade: "F9", remark: "Fail - very poor performance" },
];

/*
=====================================
MAIN GRADING FUNCTION
=====================================
*/
export const calculateGrade = (score = 0) => {
  try {
    const numericScore = Number(score);

    const result = gradeScale.find(
      (g) =>
        numericScore >= g.min &&
        numericScore <= g.max
    );

    if (!result) {
      return {
        grade: "F9",
        remark: "Invalid score",
      };
    }

    return {
      grade: result.grade,
      remark: result.remark,
    };
  } catch (error) {
    console.error("GRADING ERROR:", error);

    return {
      grade: "F9",
      remark: "Error calculating grade",
    };
  }
};

/*
=====================================
BATCH GRADING (FOR ANALYTICS / RESULTS)
=====================================
*/
export const calculateBatchGrades = (subjects = []) => {
  return subjects.map((sub) => {
    const ca1 = Number(sub.ca1 || 0);
    const ca2 = Number(sub.ca2 || 0);
    const exam = Number(sub.exam || 0);

    const total = ca1 + ca2 + exam;

    const gradeData = calculateGrade(total);

    return {
      subject: sub.subject,
      ca1,
      ca2,
      exam,
      total,
      grade: gradeData.grade,
      remark: gradeData.remark,
    };
  });
};

/*
=====================================
GRADE POINT (FOR FUTURE GPA SYSTEM)
=====================================
*/
export const getGradePoint = (grade) => {
  const points = {
    A1: 5.0,
    B2: 4.5,
    B3: 4.0,
    C4: 3.5,
    C5: 3.0,
    C6: 2.5,
    D7: 2.0,
    E8: 1.0,
    F9: 0.0,
  };

  return points[grade] || 0.0;
};

/*
=====================================
AVERAGE GRADE CALCULATOR
=====================================
*/
export const calculateAverageGrade = (subjects = []) => {
  if (!subjects.length) return 0;

  const totalPoints = subjects.reduce((sum, sub) => {
    return sum + getGradePoint(sub.grade);
  }, 0);

  return Number((totalPoints / subjects.length).toFixed(2));
};