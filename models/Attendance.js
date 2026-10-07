import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    className: {
      type: String,
      required: true,
      index: true,
    },

    date: {
      type: String, // 🔥 changed to STRING for daily tracking (YYYY-MM-DD)
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
      lowercase: true,
      index: true,
    },

    remarks: {
      type: String,
      default: "",
    },

    // 🔥 NEW: notification tracking for WhatsApp/SMS
    notificationSent: {
      type: Boolean,
      default: false,
    },

    notificationChannel: {
      type: String,
      enum: ["none", "whatsapp", "sms"],
      default: "none",
    },
  },
  {
    timestamps: true,
  }
);

/*
=====================================
PREVENT DUPLICATE DAILY ATTENDANCE
(one student per class per day)
=====================================
*/
attendanceSchema.index(
  { school: 1, student: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Attendance", attendanceSchema);