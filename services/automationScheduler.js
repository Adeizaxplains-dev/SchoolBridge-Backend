import cron from "node-cron";
import {
  runFeeReminderJob,
} from "./feeReminderEngine.js";

/* Runs every day at 8AM */
cron.schedule("0 8 * * *", async () => {
  console.log(
    "Running fee reminder job..."
  );

  await runFeeReminderJob();
});