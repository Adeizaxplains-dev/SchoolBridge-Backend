import Subscription from "../models/Subscription.js";
import School from "../models/School.js";

/**
 * ==========================================
 * ⏰ SUBSCRIPTION EXPIRY JOB (PRODUCTION READY)
 * Runs daily via cron
 * ==========================================
 */
export const expireSubscriptions = async () => {
  try {
    const now = new Date();

    // 🔥 Step 1: Find expired subscriptions
    const expiredSubs = await Subscription.find({
      endDate: { $lt: now },
      status: "active",
    });

    if (expiredSubs.length === 0) {
      console.log("✅ No subscriptions to expire");
      return;
    }

    const schools = expiredSubs.map((sub) => sub.school);

    // 🔥 Step 2: Mark subscriptions as expired
    const subResult = await Subscription.updateMany(
      {
        _id: { $in: expiredSubs.map((s) => s._id) },
      },
      {
        status: "expired",
        autoRenew: false,
      }
    );

    // 🔥 Step 3: Sync school status
    const schoolResult = await School.updateMany(
      {
        _id: { $in: schools },
      },
      {
        subscriptionStatus: "expired",
      }
    );

    console.log("==================================");
    console.log("🔔 Subscription Expiry Job Run");
    console.log("Expired Subscriptions:", subResult.modifiedCount);
    console.log("Updated Schools:", schoolResult.modifiedCount);
    console.log("==================================");
  } catch (error) {
    console.error("❌ Subscription Job Error:", error.message);
  }
};