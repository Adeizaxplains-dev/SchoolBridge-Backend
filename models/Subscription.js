import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["Trial", "Starter", "Growth"],
      default: "Trial",
    },

    status: {
      type: String,
      enum: ["active", "inactive", "expired", "cancelled"],
      default: "active",
    },

    // 💳 billing info
    amount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "NGN",
    },

    billingCycle: {
      type: String,
      enum: ["monthly", "term", "yearly"],
      default: "term",
    },

    // 🔐 payment tracking (Paystack-ready)
    provider: {
      type: String,
      default: "paystack",
    },

    reference: {
      type: String,
    },

    // 📅 subscription timing
    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
    },

    nextBillingDate: {
      type: Date,
    },

    // 🔄 auto renewal control
    autoRenew: {
      type: Boolean,
      default: true,
    },

    // 📊 audit safety (optional but powerful)
    previousPlan: {
      type: String,
      enum: ["Trial", "Starter", "Growth"],
    },

    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/**
 * 🔥 SaaS helper method
 * Check if subscription is active
 */
subscriptionSchema.methods.isActive = function () {
  return (
    this.status === "active" &&
    (!this.endDate || new Date() < this.endDate)
  );
};

/**
 * 🔥 Auto-expiry helper (can be used in cron job later)
 */
subscriptionSchema.methods.isExpired = function () {
  return this.endDate && new Date() > this.endDate;
};

export default mongoose.model("Subscription", subscriptionSchema);