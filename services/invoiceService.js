import { createInvoice } from "../repositories/invoiceRepository.js";

export const createInvoiceService = async (
  data
) => {
  return await createInvoice(data);
};