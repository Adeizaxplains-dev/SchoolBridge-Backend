import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    name: String,
    phone: String,
    email: String,

    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Parent", parentSchema);