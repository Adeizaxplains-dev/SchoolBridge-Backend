import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(
    {
      school: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "School",
      },

      studentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },

      phone: String,

      type: {
        type: String,
        enum: [
          "attendance",
          "fees",
          "result",
          "general",
        ],
      },

      message: String,

      status: {
        type: String,
        enum: [
          "sent",
          "failed",
        ],
        default: "sent",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Notification",
  notificationSchema
);