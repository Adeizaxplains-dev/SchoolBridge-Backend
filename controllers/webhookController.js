import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import School from "../models/School.js";

export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // 🔐 VERIFY PAYSTACK SIGNATURE (CRITICAL)
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Unauthorized webhook");
    }

    const event = req.body;

    // only process successful payments
    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const data = event.data;
    const metadata = data.metadata || {};

    const { schoolId, plan } = metadata;

    if (!schoolId || !plan) {
      return res.status(400).send("Missing metadata");
    }

    // 🔥 PREVENT DUPLICATES (IMPORTANT FIX)
    const existing = await Subscription.findOne({
      reference: data.reference,
    });

    if (existing) {
      return res.sendStatus(200);
    }

    // 🏫 UPDATE SCHOOL
    await School.findByIdAndUpdate(schoolId, {
      subscriptionPlan: plan,
      subscriptionStatus: "active",
    });

    // 📦 UPSERT SUBSCRIPTION (NOT CREATE DUPLICATES)
    await Subscription.findOneAndUpdate(
      { school: schoolId },
      {
        school: schoolId,
        plan,
        status: "active",
        amount: data.amount / 100,
        reference: data.reference,
        startDate: new Date(),
        endDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        ),
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log("✅ Subscription upgraded via webhook:", schoolId);

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.sendStatus(500);
  }
};