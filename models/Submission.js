import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    fileUrl: String,

    score: {
      type: Number,
      default: null,
    },

    feedback: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "Submission",
  submissionSchema
);