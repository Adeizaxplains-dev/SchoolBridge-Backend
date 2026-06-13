import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    title: String,
    description: String,

    type: {
      type: String,
      enum: ["note", "pdf", "assignment"],
    },

    fileUrl: String,

    subject: String,

    classLevel: String,

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Resource",
  resourceSchema
);