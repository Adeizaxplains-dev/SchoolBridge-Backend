import { initializePayment } from "../services/paystackService.js";
import Subscription from "../models/Subscription.js";

/**
 * INITIATE SUBSCRIPTION PAYMENT
 * SaaS: School upgrades plan via Paystack
 */
export const initializeSubscriptionPayment = async (req, res) => {
  try {
    const { plan, amount } = req.body;

    const school = req.school;
    const user = req.user;

    // 🛑 BASIC VALIDATION
    if (!plan || !amount) {
      return res.status(400).json({
        success: false,
        message: "Plan and amount are required",
      });
    }

    // 🧠 OPTIONAL: prevent duplicate active subscription upgrade
    const activeSub = await Subscription.findOne({
      school: school._id,
      status: "active",
    });

    if (activeSub && activeSub.plan === plan) {
      return res.status(400).json({
        success: false,
        message: "You are already on this plan",
      });
    }

    // 💳 CREATE PAYSTACK PAYMENT
    const payment = await initializePayment({
      email: user.email,
      amount: amount * 100, // convert to kobo
      callback_url: `${process.env.FRONTEND_URL}/billing?status=success`,
      metadata: {
        schoolId: school._id,
        userId: user._id,
        plan,
      },
    });

    // 🔥 RETURN PAYMENT LINK
    return res.status(200).json({
      success: true,
      message: "Payment initialized",
      authorization_url: payment.data.authorization_url,
      reference: payment.data.reference,
    });

  } catch (err) {
    console.error("Payment Init Error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: err.message,
    });
  }
};