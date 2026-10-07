import cron from "node-cron";
import axios from "axios";
import Fee from "../models/Fee.js";

/*
=================================
SEND WHATSAPP MESSAGE
=================================
*/
const sendWhatsApp = async (
  phone,
  message
) => {
  try {
    await axios.post(
      "YOUR_WHATSAPP_API_ENDPOINT",
      {
        to: phone,
        body: message,
      }
    );

    console.log(
      `WhatsApp sent to ${phone}`
    );

  } catch (error) {
    console.error(
      "WhatsApp Error:",
      error.message
    );
  }
};

/*
=================================
DAILY FEE REMINDERS
=================================
*/
cron.schedule(
  "0 8 * * *",
  async () => {
    try {
      const overdueFees =
        await Fee.find({
          balance: { $gt: 0 },
        }).populate(
          "studentId"
        );

      for (const fee of overdueFees) {

        const phone =
          fee.studentId
            ?.parentPhone;

        if (!phone) continue;

        const message =
          `Dear Parent, ${fee.studentId.fullName} has an outstanding school fee balance of ₦${fee.balance}. Please make payment as soon as possible.`;

        await sendWhatsApp(
          phone,
          message
        );
      }

      console.log(
        "Fee reminders completed"
      );

    } catch (error) {
      console.error(
        "Reminder Engine Error:",
        error
      );
    }
  }
);