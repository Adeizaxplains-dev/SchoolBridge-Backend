import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true
    },

    term: {
      type: String,
      required: true
    },

    session: {
      type: String,
      required: true
    },

    className: {
      type: String,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    paidAmount: {
      type: Number,
      default: 0
    },

    balance: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Paid",
        "Partially Paid",
        "Unpaid"
      ],
      default: "Unpaid"
    },

    dueDate: {
      type: Date
    },

    paymentHistory: [
      {
        amount: Number,

        method: {
          type: String,
          default: "Cash"
        },

        reference: String,

        paidAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Fee", feeSchema);