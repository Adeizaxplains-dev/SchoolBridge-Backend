import axios from "axios";

/*
=====================================
NOTIFICATION SERVICE (WhatsApp-ready)
=====================================
Supports:
- WhatsApp (Meta / Twilio later)
- SMS fallback (future)
- Email fallback (future)
=====================================
*/

export const sendNotification = async ({
  channel = "whatsapp",
  recipient,
  message,
}) => {
  try {
    if (!recipient || !message) {
      throw new Error("Recipient and message are required");
    }

    console.log("📢 Sending notification...");
    console.log("Channel:", channel);
    console.log("Recipient:", recipient);
    console.log("Message:", message);

    /*
    =====================================
    WHATSAPP (PLACEHOLDER INTEGRATION)
    =====================================
    You can later plug:
    - Meta WhatsApp Cloud API
    - Twilio WhatsApp API
    =====================================
    */

    if (channel === "whatsapp") {
      // MOCK SUCCESS (for now)
      return {
        success: true,
        message: "WhatsApp notification queued (mock)",
      };
    }

    return {
      success: true,
      message: "Notification sent (mock)",
    };
  } catch (error) {
    console.error("Notification Error:", error.message);

    return {
      success: false,
      message: error.message,
    };
  }
};