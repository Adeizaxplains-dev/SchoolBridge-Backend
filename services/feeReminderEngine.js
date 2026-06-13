import Fee from "../models/Fee.js";
import Student from "../models/Student.js";
import { sendWhatsAppMessage } from "./whatsappService.js";

export const runFeeReminderJob =
  async () => {
    try {
      const unpaidFees =
        await Fee.find({
          balance: { $gt: 0 },
        }).populate("student");

      for (let fee of unpaidFees) {
        const student = fee.student;

        const message = `
Hello Parent,

Your child ${student.name} has an outstanding fee of ₦${fee.balance}.

Please make payment to avoid penalties.

SchoolBridge
        `;

        if (student.phone) {
          await sendWhatsAppMessage(
            student.phone,
            message
          );
        }
      }

      console.log(
        "Fee reminders sent successfully"
      );
    } catch (err) {
      console.error(err);
    }
  };