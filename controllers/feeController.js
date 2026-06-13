import Fee from "../models/Fee.js";
import Student from "../models/Student.js";

/*
CREATE FEE RECORD
*/
export const createFee = async (req, res) => {
  try {
    const { studentId, term, totalAmount } = req.body;

    const fee = await Fee.create({
      studentId,
      term,
      totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      schoolId: req.schoolId
    });

    res.status(201).json(fee);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
GET ALL FEES
*/
export const getFees = async (req, res) => {
  try {
    const fees = await Fee.find({
      schoolId: req.schoolId
    }).populate("studentId");

    res.json(fees);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
RECORD PAYMENT
*/
export const makePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        message: "Fee record not found"
      });
    }

    fee.paidAmount += Number(amount);
    fee.balance = fee.totalAmount - fee.paidAmount;

    await fee.save();

    res.json({
      message: "Payment recorded successfully",
      fee
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
GET SINGLE FEE
*/
export const getFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate("studentId");

    if (!fee) {
      return res.status(404).json({
        message: "Fee not found"
      });
    }

    res.json(fee);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
GET DEFAULTERS
*/
export const getDefaulters = async (req, res) => {
  try {
    const defaulters = await Fee.find({
      schoolId: req.schoolId,
      balance: { $gt: 0 }
    }).populate("studentId");

    res.json(defaulters);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
FEE DASHBOARD SUMMARY
*/
export const getFeeStats = async (req, res) => {
  try {
    const fees = await Fee.find({
      schoolId: req.schoolId
    });

    const totalExpected = fees.reduce(
      (sum, fee) => sum + fee.totalAmount,
      0
    );

    const totalCollected = fees.reduce(
      (sum, fee) => sum + fee.paidAmount,
      0
    );

    const outstanding = fees.reduce(
      (sum, fee) => sum + fee.balance,
      0
    );

    const defaulters = fees.filter(
      fee => fee.balance > 0
    ).length;

    res.json({
      totalExpected,
      totalCollected,
      outstanding,
      defaulters
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};