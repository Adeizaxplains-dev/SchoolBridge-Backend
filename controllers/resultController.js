import Result from "../models/Result.js";
import Student from "../models/Student.js";
import School from "../models/School.js";
import ResultSubject from "../models/ResultSubject.js";

export const createResult = async (req, res) => {
try {
const {
studentId,
className,
term,
session,
subjects,
} = req.body;

if (
  !studentId ||
  !term ||
  !session ||
  !subjects?.length
) {
  return res.status(400).json({
    success: false,
    message: "Missing required fields",
  });
}

const student =
  await Student.findById(studentId);

if (!student) {
  return res.status(404).json({
    success: false,
    message: "Student not found",
  });
}

let totalScore = 0;

const processedSubjects =
  subjects.map((sub) => {
    const ca1 = Number(sub.ca1 || 0);
    const ca2 = Number(sub.ca2 || 0);
    const ca3 = Number(sub.ca3 || 0);
    const exam = Number(sub.exam || 0);

    const total =
      ca1 + ca2 + ca3 + exam;

    totalScore += total;

    let grade = "F";
    let remark = "Fail";

    if (total >= 75) {
      grade = "A";
      remark = "Excellent";
    } else if (total >= 65) {
      grade = "B";
      remark = "Very Good";
    } else if (total >= 55) {
      grade = "C";
      remark = "Good";
    } else if (total >= 45) {
      grade = "D";
      remark = "Fair";
    } else if (total >= 40) {
      grade = "E";
      remark = "Pass";
    }

    return {
      subject: sub.subject,
      ca1,
      ca2,
      ca3,
      exam,
      total,
      percentage: total,
      grade,
      remark,
      teacherComment:
        sub.teacherComment || "",
    };
  });

  const totalSubjects =
  processedSubjects.length;

const average =
  totalSubjects > 0
    ? totalScore / totalSubjects
    : 0;

const percentage =
  totalSubjects > 0
    ? (totalScore /
        (totalSubjects * 100)) *
      100
    : 0;

/*
CREATE RESULT FIRST
*/

const result =
  await Result.create({
    school: req.school,

    studentId,

    studentName:
      student.name,

    admissionNumber:
      student.admissionNumber,

    studentPassport:
      student.passport,

    className,

    term,

    session,

    totalSubjects:
      processedSubjects.length,

    totalScore,

    average,

    percentage,

    subjects: [],
  });

/*
CREATE SUBJECTS
*/

const createdSubjects =
  await ResultSubject.insertMany(
    processedSubjects.map(
      (subject) => ({
        ...subject,

        school:
          req.school,

        studentId,

        resultId:
          result._id,
      })
    )
  );

/*
LINK SUBJECTS TO RESULT
*/

result.subjects =
  createdSubjects.map(
    (subject) =>
      subject._id
  );

await result.save();

return res.status(201).json({
  success: true,
  data: result,
});

} catch (error) {
console.error(
"CREATE RESULT ERROR:",
error
);

return res.status(500).json({
  success: false,
  message:
    error.message,
});
}
};

/*
=====================================
GET RESULTS (SCHOOL)
=====================================
*/
export const getResults = async (req, res) => {
try {
const results = await Result.find({
school: req.school._id,
})
.populate("studentId")
.populate("subjects")
.sort({ createdAt: -1 });

return res.json({
  success: true,
  data: results,
});

} catch (error) {
return res.status(500).json({
success: false,
message: error.message,
});
}
};

/*
=====================================
GET RESULT BY ID
=====================================
*/
export const getResultById = async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      school: req.school._id,
    })
      .populate("studentId")
      .populate("subjects");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("GET RESULT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/*
====================================
DELETE RESULT (SAAS SAFE)
====================================
*/
/*
=====================================
DELETE RESULT
=====================================
*/
export const deleteResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      school: req.school._id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    // Delete all linked subjects
    await ResultSubject.deleteMany({
      resultId: result._id,
    });

    await Result.findByIdAndDelete(result._id);

    return res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });

  } catch (error) {
    console.error("DELETE RESULT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



/*
=====================================
GET CLASS RESULTS
=====================================
*/
export const getClassResults = async (req, res) => {
  try {
    const school = req.school._id;

    let { className, session, term } = req.query;

    if (!className || !session || !term) {
      return res.status(400).json({
        success: false,
        message:
          "className, session and term are required",
      });
    }

    className = className.trim();
    session = session.trim();
    term = term.trim();

    const results = await Result.find({
      school,
      className,
      session,
      term,
    })
      .populate("studentId")
      .populate("subjects")
      .sort({
        percentage: -1,
      });

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });

  } catch (error) {
    console.error("GET CLASS RESULTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
    
/*
=====================================
RESULT ANALYTICS
=====================================
*/
export const getResultAnalytics = async (req, res) => {
  try {
    const school = req.school._id;

    const results = await Result.find({
      school,
    }).lean();

    const totalStudents = results.length;

    if (!totalStudents) {
      return res.json({
        success: true,
        analytics: {
          totalStudents: 0,
          averageScore: 0,
          passRate: 0,
          failRate: 0,
          subjectPerformance: [],
          classPerformance: [],
          gradeDistribution: [],
          topStudents: [],
          bottomStudents: [],
          insights: [],
        },
      });
    }

    const averageScore =
      results.reduce(
        (sum, r) => sum + Number(r.percentage || 0),
        0
      ) / totalStudents;

    const passed = results.filter(
      (r) => Number(r.percentage) >= 40
    ).length;

    const passRate = (
      (passed / totalStudents) *
      100
    ).toFixed(1);

    const failRate = (
      100 - passRate
    ).toFixed(1);

    // Subject Performance

    const subjectMap = {};

    results.forEach((result) => {
      result.subjects?.forEach((subject) => {
        if (!subjectMap[subject.subject]) {
          subjectMap[subject.subject] = {
            total: 0,
            count: 0,
          };
        }

        subjectMap[subject.subject].total +=
          Number(subject.total || 0);

        subjectMap[subject.subject].count++;
      });
    });

    const subjectPerformance =
      Object.keys(subjectMap).map((subject) => ({
        subject,
        average:
          subjectMap[subject].total /
          subjectMap[subject].count,
      }));

    // Grade Distribution

    const grades = {};

    results.forEach((r) => {
      const score = Number(r.percentage);

      let grade = "F";

      if (score >= 75) grade = "A";
      else if (score >= 65) grade = "B";
      else if (score >= 55) grade = "C";
      else if (score >= 45) grade = "D";
      else if (score >= 40) grade = "E";

      grades[grade] = (grades[grade] || 0) + 1;
    });

    const gradeDistribution =
      Object.keys(grades).map((g) => ({
        grade: g,
        count: grades[g],
      }));

    // Class Performance

    const classMap = {};

    results.forEach((r) => {
      if (!classMap[r.className]) {
        classMap[r.className] = {
          total: 0,
          count: 0,
        };
      }

      classMap[r.className].total +=
        Number(r.percentage);

      classMap[r.className].count++;
    });

    const classPerformance =
      Object.keys(classMap).map((c) => ({
        class: c,
        average:
          classMap[c].total /
          classMap[c].count,
      }));

    // Rankings

    const sorted = [...results].sort(
      (a, b) => b.percentage - a.percentage
    );

    const topStudents = sorted.slice(0, 5);

    const bottomStudents =
      sorted.slice(-5).reverse();

    return res.json({
      success: true,
      analytics: {
        totalStudents,
        averageScore: averageScore.toFixed(2),
        passRate,
        failRate,
        subjectPerformance,
        classPerformance,
        gradeDistribution,
        topStudents,
        bottomStudents,
        insights: [
          `School average is ${averageScore.toFixed(1)}%.`,
          `${passRate}% of students passed.`,
          `${failRate}% of students need improvement.`,
        ],
      },
    });

  } catch (error) {
    console.error(
      "RESULT ANALYTICS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
GET RESULTS FOR A STUDENT
=====================================
*/

export const getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({
      school: req.school._id,
      studentId: req.params.studentId,
    })
      .populate("subjects")
      .sort({
        session: -1,
        term: -1,
        createdAt: -1,
      });

    return res.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error("GET STUDENT RESULTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
UPDATE RESULT
=====================================
*/

export const updateResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      school: req.school._id,
    }).populate("subjects");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const {
      className,
      term,
      session,
      teacherRemark,
      principalRemark,
      status,
      subjects,
    } = req.body;

    let totalScore = 0;

    const updatedSubjectIds = [];

    for (const sub of subjects || []) {
      const ca1 = Number(sub.ca1 || 0);
      const ca2 = Number(sub.ca2 || 0);
      const ca3 = Number(sub.ca3 || 0);
      const exam = Number(sub.exam || 0);

      const total = ca1 + ca2 + ca3 + exam;

      totalScore += total;

      let grade = "F";
      let remark = "Fail";

      if (total >= 75) {
        grade = "A";
        remark = "Excellent";
      } else if (total >= 65) {
        grade = "B";
        remark = "Very Good";
      } else if (total >= 55) {
        grade = "C";
        remark = "Good";
      } else if (total >= 45) {
        grade = "D";
        remark = "Fair";
      } else if (total >= 40) {
        grade = "E";
        remark = "Pass";
      }

      let subject;

      if (sub._id) {
        subject =
          await ResultSubject.findByIdAndUpdate(
            sub._id,
            {
              subject: sub.subject,
              ca1,
              ca2,
              ca3,
              exam,
              total,
              percentage: total,
              grade,
              remark,
              teacherComment:
                sub.teacherComment || "",
            },
            { new: true }
          );
      } else {
        subject =
          await ResultSubject.create({
            school: req.school._id,
            studentId: result.studentId,
            resultId: result._id,

            subject: sub.subject,
            ca1,
            ca2,
            ca3,
            exam,
            total,
            percentage: total,
            grade,
            remark,
            teacherComment:
              sub.teacherComment || "",
          });
      }

      updatedSubjectIds.push(subject._id);
    }

    const totalSubjects =
      updatedSubjectIds.length;

    const average =
      totalSubjects > 0
        ? totalScore / totalSubjects
        : 0;

    const percentage =
      totalSubjects > 0
        ? (totalScore /
            (totalSubjects * 100)) *
          100
        : 0;

    result.className =
      className || result.className;

    result.term =
      term || result.term;

    result.session =
      session || result.session;

    result.teacherRemark =
      teacherRemark ||
      result.teacherRemark;

    result.principalRemark =
      principalRemark ||
      result.principalRemark;

    result.status =
      status || result.status;

    result.totalSubjects =
      totalSubjects;

    result.totalScore =
      totalScore;

    result.average =
      average;

    result.percentage =
      percentage;

    result.subjects =
      updatedSubjectIds;

    await result.save();

    const updated =
      await Result.findById(result._id)
        .populate("studentId")
        .populate("subjects");

    return res.status(200).json({
      success: true,
      message:
        "Result updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(
      "UPDATE RESULT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};