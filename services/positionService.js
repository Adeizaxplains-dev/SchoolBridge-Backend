import Result from "../models/Result.js";

/*
=====================================================
SCHOOLBRIDGE POSITION ENGINE
=====================================================
*/

/*
=====================================
CALCULATE SINGLE STUDENT POSITION
=====================================
*/
export const calculatePosition = async ({
  school,
  className,
  term,
  session,
  studentId,
}) => {
  try {
    const results = await Result.find({
      school,
      className,
      term,
      session,
    }).sort({
      percentage: -1,
      totalScore: -1,
    });

    let position = 0;
    let lastScore = null;
    let actualRank = 0;

    for (let i = 0; i < results.length; i++) {
      const score = results[i].percentage;

      if (score !== lastScore) {
        actualRank = i + 1;
      }

      lastScore = score;

      if (
        results[i].studentId.toString() ===
        studentId.toString()
      ) {
        position = actualRank;
        break;
      }
    }

    return position;
  } catch (error) {
    console.error(
      "Calculate Position Error:",
      error
    );

    return 0;
  }
};

/*
=====================================
RECALCULATE ENTIRE CLASS
=====================================
*/
export const calculatePositions = async ({
  school,
  className,
  term,
  session,
}) => {
  try {
    const results = await Result.find({
      school,
      className,
      term,
      session,
    }).sort({
      percentage: -1,
      totalScore: -1,
    });

    let lastScore = null;
    let currentPosition = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (
        lastScore === null ||
        result.percentage !== lastScore
      ) {
        currentPosition = i + 1;
      }

      lastScore = result.percentage;

      result.position = currentPosition;
      result.classSize = results.length;

      await result.save();
    }

    return true;
  } catch (error) {
    console.error(
      "Calculate Positions Error:",
      error
    );

    return false;
  }
};

/*
=====================================
CLASS RANKING
=====================================
*/
export const getClassRanking = async ({
  school,
  className,
  term,
  session,
}) => {
  try {
    const results = await Result.find({
      school,
      className,
      term,
      session,
    })
      .populate(
        "studentId",
        "name passport class"
      )
      .sort({
        position: 1,
      });

    return results;
  } catch (error) {
    console.error(
      "Class Ranking Error:",
      error
    );

    return [];
  }
};