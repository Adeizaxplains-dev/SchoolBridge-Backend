import axios from "axios";

/*
=====================================
PAYSTACK CLIENT
=====================================
*/
const paystackClient = axios.create({
  baseURL: "https://api.paystack.co",
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

/*
=====================================
INITIALIZE PAYMENT
=====================================
*/
export const initializePayment = async (payload) => {
  try {
    const response = await paystackClient.post(
      "/transaction/initialize",
      payload
    );

    return response.data;
  } catch (error) {
    console.error(
      "Paystack Initialize Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Payment initialization failed"
    );
  }
};

/*
=====================================
VERIFY PAYMENT
=====================================
*/
export const verifyPayment = async (reference) => {
  try {
    const response = await paystackClient.get(
      `/transaction/verify/${reference}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Paystack Verify Error:",
      error.response?.data || error.message
    );

    throw new Error("Payment verification failed");
  }
};