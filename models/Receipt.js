import mongoose from "mongoose";

const receiptSchema =
  new mongoose.Schema(
    {
      school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
      },

      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },

      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },

      receiptNumber: {
        type: String,
        unique: true,
      },

      fileUrl: String,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Receipt",
  receiptSchema
);