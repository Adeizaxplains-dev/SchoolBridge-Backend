import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    title: String,
    description: String,

    subject: String,
    classLevel: String,

    dueDate: Date,

    fileUrl: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Assignment",
  assignmentSchema
);