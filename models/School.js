import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  name: String,
  code: String,
  email: String,
  plan: {
    type: String,
    default: "trial"
  },
  studentLimit: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

export default mongoose.model("School", schoolSchema);