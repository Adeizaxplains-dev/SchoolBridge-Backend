import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    balance: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["unpaid", "partial", "paid", "cancelled"],
      default: "unpaid",
      index: true,
    },

    // 🔥 Payment tracking for webhook safety
    reference: {
      type: String,
      index: true,
    },

    // 🔥 billing metadata (optional but powerful for SaaS expansion)
    term: {
      type: String, // e.g. "first term", "second term"
    },

    session: {
      type: String, // e.g. "2025/2026"
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ==========================================
 * 🔥 HELPER: mark invoice as paid safely
 * ==========================================
 */
invoiceSchema.methods.markPaid = function () {
  this.paidAmount = this.amount;
  this.balance = 0;
  this.status = "paid";
  return this;
};

/**
 * ==========================================
 * 🔥 HELPER: apply payment
 * ==========================================
 */
invoiceSchema.methods.applyPayment = function (amount) {
  this.paidAmount += amount;
  this.balance = this.amount - this.paidAmount;

  if (this.balance <= 0) {
    this.balance = 0;
    this.status = "paid";
  } else {
    this.status = "partial";
  }

  return this;
};

export default mongoose.model("Invoice", invoiceSchema);