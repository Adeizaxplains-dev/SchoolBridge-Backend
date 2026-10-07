import axios from "axios";
import Payment from "../models/Payment.js";
import Fee from "../models/Fee.js";
import PDFDocument from "pdfkit";

/*
=====================================
RECORD MANUAL PAYMENT
=====================================
*/
export const recordPayment = async (req, res) => {
  try {
    const { feeId, studentId, amount, method } = req.body;

    const fee = await Fee.findOne({
      _id: feeId,
      school: req.school,
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    const paymentAmount = Number(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    if (fee.paidAmount + paymentAmount > fee.amount) {
      return res.status(400).json({
        success: false,
        message: "Payment exceeds fee amount",
      });
    }

    const payment = await Payment.create({
      school: req.school,
      feeId,
      studentId,
      amount: paymentAmount,
      method,
    });

    fee.paidAmount += paymentAmount;
    fee.balance = fee.amount - fee.paidAmount;

    if (fee.balance <= 0) {
      fee.balance = 0;
      fee.status = "paid";
    } else {
      fee.status = "partial";
    }

    await fee.save();

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });

  } catch (error) {
    console.error("PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
GET PAYMENTS (FIXED POPULATION)
=====================================
*/
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      school: req.school,
    })
      .populate("studentId", "name class phone")
      .populate("feeId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payments,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
INITIALIZE PAYSTACK PAYMENT (FIXED EXPORT NAME)
=====================================
*/
export const initializePayment = async (req, res) => {
  try {
    const { feeId } = req.body;

    const fee = await Fee.findOne({
      _id: feeId,
      school: req.school,
    }).populate("studentId");

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    const amount = Math.max(fee.balance || 0, 0);

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "No outstanding balance",
      });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: req.user?.email || req.school?.email,
        amount: Math.round(amount * 100),
        metadata: {
          feeId: fee._id,
          studentId: fee.studentId?._id,
          school: req.school,
        },
        callback_url: "http://localhost:5173/fees/payments",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });

  } catch (error) {
    console.error("PAYSTACK ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message,
    });
  }
};

/*
=====================================
RECEIPT (FIXED NAME FIELD)
=====================================
*/
export const generateReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("studentId", "name class phone")
      .populate("feeId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=receipt-${payment._id}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22).text("SchoolBridge Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(14);

    doc.text(`Receipt ID: ${payment._id}`);
    doc.text(`Student: ${payment.studentId?.name || "N/A"}`);
    doc.text(`Class: ${payment.studentId?.class || "N/A"}`);
    doc.text(`Amount Paid: ₦${payment.amount}`);
    doc.text(`Payment Method: ${payment.method}`);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleString()}`);

    doc.end();

  } catch (error) {
    console.error("RECEIPT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};