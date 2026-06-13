import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    name: String,

    code: String,
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);