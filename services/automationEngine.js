import Fee from "../models/Fee.js";

export const automationEngine = async (
  schoolId
) => {
  const defaulters = await Fee.find({
    school: schoolId,
    balance: { $gt: 0 },
  });

  return {
    feeReminderCandidates:
      defaulters.length,

    automations: [
      {
        type: "Fee Reminder",
        status: "active",
      },
      {
        type: "Attendance Alert",
        status: "active",
      },
    ],
  };
};