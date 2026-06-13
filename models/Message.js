import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    },

    recipientName: {
      type: String,
      required: true
    },

    recipientPhone: {
      type: String,
      required: true
    },

    recipientEmail: {
      type: String
    },

    channel: {
      type: String,
      enum: ["WhatsApp", "SMS", "Email"],
      default: "WhatsApp"
    },

    category: {
      type: String,
      enum: [
        "Fee Reminder",
        "Result Notification",
        "Attendance Alert",
        "Announcement",
        "Custom"
      ],
      default: "Custom"
    },

    subject: {
      type: String
    },

    message: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Scheduled",
        "Sent",
        "Delivered",
        "Failed"
      ],
      default: "Pending"
    },

    scheduledFor: {
      type: Date
    },

    sentAt: {
      type: Date
    },

    deliveryResponse: {
      type: Object
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "Message",
  messageSchema
);