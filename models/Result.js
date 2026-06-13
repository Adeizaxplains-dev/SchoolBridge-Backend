import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    subject: String,

    score: Number,

    grade: String,

    term: String,

    session: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "Result",
  resultSchema
);