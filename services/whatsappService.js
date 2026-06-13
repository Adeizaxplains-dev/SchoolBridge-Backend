import axios from "axios";

export const sendWhatsAppMessage = async (
  phone,
  message
) => {
  try {
    const response = await axios.post(
      process.env.WHATSAPP_API_URL,
      {
        to: phone,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error(
      "WhatsApp Error:",
      err.response?.data || err.message
    );
  }
};