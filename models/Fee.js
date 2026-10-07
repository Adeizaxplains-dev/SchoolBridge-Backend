import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
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

    category: {
      type: String,
      enum: [
        "Tuition",
        "Transport",
        "Uniform",
        "Books",
        "PTA",
        "Examination",
        "Hostel",
        "Other",
      ],
      required: true,
    },

    term: {
      type: String,
      enum: ["first", "second", "third"],
      required: true,
    },

    session: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
====================================
AUTO CALCULATE BALANCE & STATUS
====================================
*/
feeSchema.pre("save", function () {
  this.balance = this.amount - this.paidAmount;

  if (this.balance <= 0) {
    this.balance = 0;
    this.status = "paid";
  } else if (this.paidAmount > 0) {
    this.status = "partial";
  } else {
    this.status = "unpaid";
  }
});

export default mongoose.model("Fee", feeSchema);