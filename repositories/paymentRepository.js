import Payment from "../models/Payment.js";

export const createPayment = (data) =>
  Payment.create(data);

export const findPayment = (query) =>
  Payment.findOne(query);

export const updatePayment = (
  id,
  data
) =>
  Payment.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );