import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    amount: Number,

    method: {
      type: String,
      enum: ["cash", "card", "transfer", "paystack"],
    },

    reference: String,

    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);