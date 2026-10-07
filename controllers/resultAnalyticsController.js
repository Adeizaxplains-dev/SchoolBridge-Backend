import Result from "../models/Result.js";

/*
====================================
RESULT ANALYTICS (SAAS LEVEL)
====================================
*/
export const getResultAnalytics = async (req, res) => {
  try {
    const school = req.school._id;

    const results = await Result.find({ school });

    const totalResults = results.length;

    /*
    ====================================
    BASIC KPI METRICS
    ====================================
    */

    const averagePerformance =
      totalResults > 0
        ? results.reduce((sum, r) => sum + (r.percentage || 0), 0) /
          totalResults
        : 0;

    const passMark = 50;

    const distinction = results.filter((r) => r.percentage >= 75).length;
    const pass = results.filter((r) => r.percentage >= passMark).length;
    const fail = results.filter((r) => r.percentage < passMark).length;

    /*
    ====================================
    GRADE DISTRIBUTION
    ====================================
    */
    const gradeDistribution = [
      { grade: "A", count: 0 },
      { grade: "B", count: 0 },
      { grade: "C", count: 0 },
      { grade: "D", count: 0 },
      { grade: "E", count: 0 },
      { grade: "F", count: 0 },
    ];

    results.forEach((r) => {
      const subjects = r.subjects || [];

      subjects.forEach((s) => {
        const g = s.grade;

        const entry = gradeDistribution.find((x) => x.grade === g);

        if (entry) entry.count += 1;
      });
    });

    /*
    ====================================
    SUBJECT PERFORMANCE
    ====================================
    */
    const subjectMap = {};

    results.forEach((r) => {
      (r.subjects || []).forEach((s) => {
        if (!subjectMap[s.subject]) {
          subjectMap[s.subject] = {
            subject: s.subject,
            total: 0,
            count: 0,
          };
        }

        subjectMap[s.subject].total += s.total || 0;
        subjectMap[s.subject].count += 1;
      });
    });

    const subjectPerformance = Object.values(subjectMap).map((s) => ({
      subject: s.subject,
      average: Number((s.total / s.count).toFixed(2)),
    }));

    /*
    ====================================
    CLASS PERFORMANCE
    ====================================
    */
    const classMap = {};

    results.forEach((r) => {
      const cls = r.className;

      if (!classMap[cls]) {
        classMap[cls] = {
          class: cls,
          total: 0,
          count: 0,
        };
      }

      classMap[cls].total += r.percentage || 0;
      classMap[cls].count += 1;
    });

    const classPerformance = Object.values(classMap).map((c) => ({
      class: c.class,
      average: Number((c.total / c.count).toFixed(2)),
    }));

    /*
    ====================================
    STUDENT PERFORMANCE RANKING
    ====================================
    */
    const studentMap = {};

    results.forEach((r) => {
      const id = r.studentId.toString();

      if (!studentMap[id]) {
        studentMap[id] = {
          _id: id,
          name: r.studentName,
          total: 0,
          count: 0,
        };
      }

      studentMap[id].total += r.percentage || 0;
      studentMap[id].count += 1;
    });

    const students = Object.values(studentMap).map((s) => ({
      _id: s._id,
      name: s.name,
      average: Number((s.total / s.count).toFixed(2)),
    }));

    const sorted = students.sort((a, b) => b.average - a.average);

    const topStudents = sorted.slice(0, 5);
    const bottomStudents = sorted.slice(-5).reverse();

    /*
    ====================================
    FINAL RESPONSE
    ====================================
    */
    return res.status(200).json({
      success: true,
      analytics: {
        totalResults,
        averageScore: Number(averagePerformance.toFixed(2)),
        passRate: totalResults
          ? Number(((pass / totalResults) * 100).toFixed(2))
          : 0,
        failRate: totalResults
          ? Number(((fail / totalResults) * 100).toFixed(2))
          : 0,

        distinction,
        pass,
        fail,

        gradeDistribution,
        subjectPerformance,
        classPerformance,

        topStudents,
        bottomStudents,
      },
    });
  } catch (error) {
    console.error("RESULT ANALYTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};