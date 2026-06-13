import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
    },

    title: String,
    message: String,

    type: {
      type: String,
      enum: ["fee", "result", "attendance", "general"],
    },

    recipients: {
      type: String,
      enum: ["all", "students", "parents", "staff"],
    },

    status: {
      type: String,
      enum: ["pending", "sent"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);