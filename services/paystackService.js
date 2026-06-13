import axios from "axios";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

/*
  ⚠️ SAFE VALIDATION (DO NOT CRASH SERVER)
*/
if (!PAYSTACK_SECRET) {
  console.warn(
    "⚠️ PAYSTACK_SECRET_KEY is missing. Payment features will not work."
  );
}

/**
 * BASE PAYSTACK CLIENT
 */
const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

/**
 * 🔥 INITIALIZE PAYMENT
 */
export const initializePayment = async (payload) => {
  try {
    if (!PAYSTACK_SECRET) {
      throw new Error("Payment system not configured (missing PAYSTACK_SECRET_KEY)");
    }

    const response = await paystack.post(
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

/**
 * 🔥 VERIFY PAYMENT
 */
export const verifyPayment = async (reference) => {
  try {
    if (!PAYSTACK_SECRET) {
      throw new Error("Payment system not configured");
    }

    if (!reference) {
      throw new Error("Payment reference is required");
    }

    const response = await paystack.get(
      `/transaction/verify/${reference}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Paystack Verify Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
        "Payment verification failed"
    );
  }
};