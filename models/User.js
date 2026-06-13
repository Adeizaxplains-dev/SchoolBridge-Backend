import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "teacher", "parent"],
    default: "admin"
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School"
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);