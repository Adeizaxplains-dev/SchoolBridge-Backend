import cron from "node-cron";
import Fee from "../models/Fee.js";

// Every day at 8:00 AM
cron.schedule("0 8 * * *", async () => {
  try {
    const overdueFees = await Fee.find({
      balance: { $gt: 0 },
    }).populate("studentId");

    overdueFees.forEach((fee) => {
      console.log(
        `Reminder: ${fee.studentId?.fullName} owes ₦${fee.balance}`
      );
    });

    console.log(
      `Fee reminder job completed. Found ${overdueFees.length} defaulters.`
    );
  } catch (error) {
    console.error(
      "Fee Reminder Error:",
      error.message
    );
  }
});