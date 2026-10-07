import Result from "../models/Result.js";
import ResultSubject from "../models/ResultSubject.js";

import { calculateGrade } from "./gradingService.js";
import { calculatePosition } from "./positionService.js";

/*
=====================================
CREATE FULL STUDENT RESULT (CORE ENGINE)
=====================================
*/
export const createStudentResult = async ({
  school,
  schoolName,
  studentId,
  studentName,
  className,
  passport,
  term,
  session,
  subjects,
}) => {
  try {
    /*
    ================================
    STEP 1: PROCESS SUBJECTS
    ================================
    */

    let totalScore = 0;
    let obtainableScore = subjects.length * 100;

    const subjectDocs = [];

    for (const sub of subjects) {
      const ca1 = Number(sub.ca1 || 0);
      const ca2 = Number(sub.ca2 || 0);
      const exam = Number(sub.exam || 0);

      const total = ca1 + ca2 + exam;

      const grade = calculateGrade(total);

      const subjectDoc = await ResultSubject.create({
        subject: sub.subject,
        ca1,
        ca2,
        exam,
        total,
        grade,
        remark: grade.remark,
      });

      subjectDocs.push(subjectDoc._id);

      totalScore += total;
    }

    /*
    ================================
    STEP 2: CALCULATE SUMMARY
    ================================
    */

    const average = totalScore / subjects.length;
    const percentage = (totalScore / obtainableScore) * 100;

    /*
    ================================
    STEP 3: CREATE RESULT
    ================================
    */

    const result = await Result.create({
  school,
  schoolName,
  studentId,
  studentName,
  className,
  passport,
  term,
  session,
  subjects: subjectDocs,
  totalSubjects: subjects.length,
  totalScore,
  obtainableScore,
  average,
  percentage: Number(percentage.toFixed(2)),
});

    /*
    ================================
    STEP 4: ASSIGN POSITION
    ================================
    */

    const position = await calculatePosition({
      school,
      className,
      term,
      session,
      studentId,
      totalScore,
    });

    result.position = position;
    await result.save();

    return result;
  } catch (error) {
    console.error("RESULT SERVICE ERROR:", error);
    throw new Error("Failed to create result");
  }
};