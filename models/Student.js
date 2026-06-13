import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  class: String,
  feeStatus: String,
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School"
  }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);