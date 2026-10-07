import Student from "../models/Student.js";
import Notification from "../models/Notification.js";

/*
=====================================
SEND SINGLE MESSAGE
=====================================
*/

export const sendWhatsAppNotification =
  async (req, res) => {
    try {
      const {
        studentId,
        message,
      } = req.body;

      const student =
        await Student.findOne({
          _id: studentId,
          school:
            req.school._id,
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found",
        });
      }

      const phone =
        student.parentPhone ||
        student.phone;

      if (!phone) {
        return res.status(400).json({
          success: false,
          message:
            "Parent phone not found",
        });
      }

      /*
      TWILIO / META API CALL
      PLACE HERE
      */

      await Notification.create({
        school:
          req.school._id,
        studentId,
        phone,
        type: "attendance",
        message,
        status: "sent",
      });

      return res.json({
        success: true,
        message:
          "WhatsApp notification sent",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const sendBulkWhatsAppNotifications =
  async (req, res) => {
    try {
      const {
        students,
        message,
      } = req.body;

      let sent = 0;

      for (const id of students) {
        const student =
          await Student.findById(
            id
          );

        if (!student) continue;

        const phone =
          student.parentPhone ||
          student.phone;

        if (!phone) continue;

        /*
        TWILIO SEND HERE
        */

        await Notification.create({
          school:
            req.school._id,
          studentId:
            student._id,
          phone,
          type:
            "attendance",
          message,
        });

        sent++;
      }

      return res.json({
        success: true,
        sent,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };

  export const getNotificationHistory =
  async (req, res) => {
    try {
      const history =
        await Notification.find({
          school:
            req.school._id,
        })
          .populate(
            "studentId",
            "name class"
          )
          .sort({
            createdAt: -1,
          });

      return res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };