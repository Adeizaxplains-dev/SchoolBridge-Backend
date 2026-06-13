import Subscription from "../models/Subscription.js";
import School from "../models/School.js";
import { verifyPayment } from "../services/paystackService.js";

/**
 * 📦 GET SCHOOL SUBSCRIPTION
 * Returns current subscription or fallback trial
 */
export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      school: req.school._id,
    });

    // fallback if no subscription exists
    if (!subscription) {
      return res.json({
        success: true,
        data: {
          plan: "Trial",
          status: "active",
          message: "Default trial subscription active",
        },
      });
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const upgradePlan = async (req, res) => {
  try {
    const { plan, amount, reference } = req.body;

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Plan is required",
      });
    }

    let paymentVerified = false;

    // 🔥 VERIFY PAYMENT IF REFERENCE EXISTS
    if (reference) {
      const payment = await verifyPayment(reference);

      paymentVerified =
        payment?.data?.status === "success";

      if (!paymentVerified) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    }

    const startDate = new Date();

    // default billing cycle = 4 months (term system)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 4);

    // 🔥 UPSERT SUBSCRIPTION (CREATE IF NOT EXISTS)
    const subscription = await Subscription.findOneAndUpdate(
      { school: req.school._id },
      {
        school: req.school._id,
        plan,
        amount,
        status: "active",
        reference: reference || null,
        startDate,
        endDate,
        previousPlan: req.school.subscriptionPlan,
      },
      {
        new: true,
        upsert: true,
      }
    );

    // 🔥 UPDATE SCHOOL RECORD (SYNC)
    await School.findByIdAndUpdate(req.school._id, {
      subscriptionPlan: plan,
      subscriptionStatus: "active",
    });

    res.json({
      success: true,
      message: "Subscription upgraded successfully",
      data: subscription,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { school: req.school._id },
      {
        status: "cancelled",
        cancelledAt: new Date(),
      },
      { new: true }
    );

    await School.findByIdAndUpdate(req.school._id, {
      subscriptionStatus: "cancelled",
    });

    res.json({
      success: true,
      message: "Subscription cancelled",
      data: subscription,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};