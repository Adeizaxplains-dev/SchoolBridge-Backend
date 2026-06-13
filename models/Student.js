import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    class: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
    },

    dateOfBirth: {
      type: Date,
    },

    feeStatus: {
      type: String,
      enum: ["paid", "partial", "unpaid"],
      default: "unpaid",
    },

    passport: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "graduated", "withdrawn"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Student", studentSchema);