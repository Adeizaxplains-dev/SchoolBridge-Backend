import Student from "../models/Student.js";
import Message from "../models/Message.js";

export const usageEngine = async (
  schoolId,
  subscription
) => {
  const studentCount =
    await Student.countDocuments({
      school: schoolId,
    });

  const messagesSent =
    await Message.countDocuments({
      school: schoolId,
    });

  return {
    studentsUsed: studentCount,
    studentsLimit:
      subscription?.maxStudents || 0,

    messagesUsed: messagesSent,

    studentsPercent:
      subscription?.maxStudents
        ? (
            (studentCount /
              subscription.maxStudents) *
            100
          ).toFixed(1)
        : 0,
  };
};