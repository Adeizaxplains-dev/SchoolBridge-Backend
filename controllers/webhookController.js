import crypto from "crypto";

import Subscription from "../models/Subscription.js";
import School from "../models/School.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";

import { generateReceipt } from "../services/receiptService.js";
import { sendNotification } from "../services/notificationService.js";

export const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    /**
     * ==========================================
     * 🔐 VERIFY PAYSTACK SIGNATURE (FIXED)
     * ==========================================
     */
    const rawBody = req.body.toString();

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(rawBody);

    /**
     * Only process successful payments
     */
    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const data = event.data;
    const metadata = data.metadata || {};

    const amount = data.amount / 100;
    const reference = data.reference;

    /**
     * ==========================================
     * 💎 SUBSCRIPTION PAYMENT
     * ==========================================
     */
    if (metadata.type === "subscription") {
      const { school, plan } = metadata;

      const alreadyProcessed = await Subscription.findOne({
        reference,
      });

      if (alreadyProcessed) {
        return res.sendStatus(200);
      }

      await Subscription.findOneAndUpdate(
        { school: school },
        {
          school: schoolId,
          plan,
          status: "active",
          amount,
          reference,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        { upsert: true, new: true }
      );

      await School.findByIdAndUpdate(school, {
        subscriptionPlan: plan,
        subscriptionStatus: "active",
      });

      console.log("✅ Subscription activated:", school);

      return res.sendStatus(200);
    }

    /**
     * ==========================================
     * 💳 INVOICE PAYMENT
     * ==========================================
     */
    if (metadata.type === "invoice") {
      const { invoiceId, school } = metadata;

      const invoice = await Invoice.findById(invoiceId);

      if (invoice) {
        invoice.balance -= amount;

        if (invoice.balance <= 0) {
          invoice.status = "paid";
          invoice.balance = 0;
        } else {
          invoice.status = "partial";
        }

        await invoice.save();
      }

      await Payment.findOneAndUpdate(
        { reference },
        {
          school,
          invoiceId,
          amount,
          status: "verified",
          paymentMethod: "card",
          reference,
        },
        { upsert: true, new: true }
      );

      await generateReceipt({
        schoolName: "SchoolBridge",
        studentName: "Student",
        invoiceNumber: invoice?.invoiceNumber,
        amount,
        paymentMethod: "card",
      });

      await sendNotification({
        channel: "whatsapp",
        recipient: metadata.parentPhone || "unknown",
        message: `Payment of ₦${amount} received successfully.`,
      });

      console.log("✅ Invoice payment processed:", invoiceId);

      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.sendStatus(500);
  }
};