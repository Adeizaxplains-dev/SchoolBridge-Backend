import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";

export const processSuccessfulPayment =
  async ({
    reference,
    amount,
  }) => {
    const payment =
      await Payment.findOne({
        reference,
      });

    if (!payment) {
      throw new Error(
        "Payment not found"
      );
    }

    if (
      payment.status === "verified"
    ) {
      return payment;
    }

    payment.status = "verified";

    payment.verifiedAt =
      new Date();

    await payment.save();

    const invoice =
      await Invoice.findById(
        payment.invoiceId
      );

    if (invoice) {
      invoice.balance -= amount;

      if (
        invoice.balance <= 0
      ) {
        invoice.status = "paid";
        invoice.balance = 0;
      } else {
        invoice.status =
          "partial";
      }

      await invoice.save();
    }

    return payment;
  };