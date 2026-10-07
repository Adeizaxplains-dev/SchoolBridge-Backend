import mongoose from "mongoose";

const feeItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: [
        "tuition",
        "boarding",
        "transport",
        "exam",
        "uniform",
        "books",
        "feeding",
        "development",
        "sports",
        "medical",
        "other",
      ],
      default: "other",
    },

    compulsory: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const feeStructureSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicSession",
      required: true,
    },

    term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Term",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    items: {
      type: [feeItemSchema],
      default: [],
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentDeadline: {
      type: Date,
    },

    lateFee: {
      type: Number,
      default: 0,
    },

    installmentAllowed: {
      type: Boolean,
      default: false,
    },

    maximumInstallments: {
      type: Number,
      default: 1,
      min: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/*
==========================================
AUTO CALCULATE TOTAL
==========================================
*/

feeStructureSchema.pre("save", function () {
  this.totalAmount = this.items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

});

/*
==========================================
UNIQUE
==========================================
*/

feeStructureSchema.index({
  school: 1,
  session: 1,
  term: 1,
  class: 1,
});

export default mongoose.model(
  "FeeStructure",
  feeStructureSchema
);