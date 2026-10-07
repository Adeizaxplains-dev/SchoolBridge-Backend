import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    feeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fee",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      enum: [
        "cash",
        "bank_transfer",
        "paystack",
      ],
      default: "cash",
    },

    reference: String,

    status: {
      type: String,
      enum: [
        "pending",
        "successful",
        "failed",
      ],
      default: "successful",
    },

    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Payment",
  paymentSchema
);