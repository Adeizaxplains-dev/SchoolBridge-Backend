import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    name: String, // JSS1, JSS2

    arm: String, // A, B, C

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);