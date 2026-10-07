import {
  createPayment,
} from "../repositories/paymentRepository.js";

export const createPaymentService =
  async (data) => {
    return await createPayment(data);
  };