import cron from "node-cron";
import { expireSubscriptions } from "../jobs/subscriptionJob.js";

/**
 * Runs every day at 12:00 AM
 */
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running subscription expiry job...");

  await expireSubscriptions();
});