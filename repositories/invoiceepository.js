import Invoice from "../models/Invoice.js";

export const createInvoice = (data) =>
  Invoice.create(data);

export const findInvoice = (query) =>
  Invoice.findOne(query);

export const updateInvoice = (
  id,
  data
) =>
  Invoice.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

export const getInvoices = (query) =>
  Invoice.find(query);