import Fee from "../models/Fee.js";
import Student from "../models/Student.js";

/*
=====================================
CREATE FEE RECORD
=====================================
*/
export const createFee = async (req, res) => {
  try {
    console.log("========== CREATE FEE ==========");
    console.log("BODY:", req.body);
    console.log("SCHOOL ID:", req.school);

    const {
      studentId,
      term,
      amount,
      totalAmount,
      category,
      session,
      dueDate,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "studentId is required",
      });
    }

    const student = await Student.findOne({
      _id: studentId,
      school: req.school,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const feeAmount = Number(amount || totalAmount);

    if (!feeAmount || feeAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const fee = await Fee.create({
      studentId,
      school: req.school,
      category,
      term,
      session,
      amount: feeAmount,
      paidAmount: 0,
      dueDate,
    });

    return res.status(201).json({
      success: true,
      message: "Fee created successfully",
      data: fee,
    });
  } catch (error) {
    console.error("CREATE FEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
GET ALL FEES
=====================================
*/
export const getFees = async (req, res) => {
  try {
    const fees = await Fee.find({
      school: req.school,
    })
      .populate("studentId")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    console.error("GET FEES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
GET SINGLE FEE
=====================================
*/
export const getFee = async (req, res) => {
  try {
    const fee = await Fee.findOne({
      _id: req.params.id,
      school: req.school,
    }).populate("studentId");

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee not found",
      });
    }

    return res.json({
      success: true,
      data: fee,
    });
  } catch (error) {
    console.error("GET FEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
RECORD PAYMENT
=====================================
*/
export const makePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const fee = await Fee.findOne({
      _id: req.params.id,
      school: req.school,
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    if (fee.paidAmount + paymentAmount > fee.amount) {
      return res.status(400).json({
        success: false,
        message: "Payment exceeds outstanding balance",
      });
    }

    fee.paidAmount += paymentAmount;

    await fee.save();

    return res.json({
      success: true,
      message: "Payment recorded successfully",
      data: fee,
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
GET DEFAULTERS
=====================================
*/
export const getDefaulters = async (req, res) => {
  try {
    const defaulters = await Fee.find({
      school: req.school,
      balance: { $gt: 0 },
    })
      .populate({
        path: "studentId",
        select: "name class phone feeStatus",
      })
      .sort({ balance: -1 });

    return res.json({
      success: true,
      data: defaulters,
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
FEE DASHBOARD STATS
=====================================
*/
export const getFeeStats = async (req, res) => {
  try {
    const fees = await Fee.find({
      school: req.school,
    });

    console.log("FEES FOUND:", fees);

    const totalExpected = fees.reduce(
      (sum, fee) => sum + fee.amount,
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
      (fee) => fee.balance > 0
    ).length;

    console.log({
      totalExpected,
      totalCollected,
      outstanding,
      defaulters,
    });

    return res.json({
      success: true,
      data: {
        totalExpected,
        totalCollected,
        outstanding,
        defaulters,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};