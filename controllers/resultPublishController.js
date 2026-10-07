import Result from "../models/Result.js";
import School from "../models/School.js";

import { generateResultPDF } from "../services/resultPDFService.js";
import { sendResultToParentWhatsApp } from "../services/resultWhatsAppService.js";
import { sendResultEmail } from "../services/resultEmailService.js";

/*
====================================
APPROVE RESULT (SCHOOL VERIFIED)
====================================
*/
export const approveResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      school: req.school._id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    // Prevent double approval issues
    if (result.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Cannot approve a published result",
      });
    }

    result.approved = true;
    result.approvedAt = new Date();
    result.status = "approved";

    await result.save();

    return res.status(200).json({
      success: true,
      message: "Result approved successfully",
      data: result,
    });
  } catch (error) {
    console.error("APPROVE RESULT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
====================================
PUBLISH RESULT (FINAL STAGE)
====================================
*/
export const publishResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      school: req.school._id,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    if (!result.approved) {
      return res.status(400).json({
        success: false,
        message: "Result must be approved before publishing",
      });
    }

    result.status = "published";
    result.publishedAt = new Date();

    await result.save();

    return res.status(200).json({
      success: true,
      message: "Result published successfully",
      data: result,
    });
  } catch (error) {
    console.error("PUBLISH RESULT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
====================================
GENERATE PDF RESULT (SCHOOL REPORT CARD)
====================================
*/
export const generatePDF = async (req, res) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      school: req.school._id,
    })
      .populate("studentId")
      .populate("subjects");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    const pdf = await generateResultPDF({
      school: {
        name: req.school.name,
        address: req.school.address,
      },

      result: {
        ...result.toObject(),

        studentName:
          result.studentId?.name || "",

        admissionNumber:
          result.studentId?.admissionNumber ||
          "",

        studentPassport:
          result.studentId?.passport || "",
      },

      subjects: result.subjects || [],
    });

    return res.json({
      success: true,
      pdfUrl: `/uploads/results/${pdf.fileName}`,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
====================================
SEND RESULT TO PARENT (WHATSAPP)
====================================
*/
/*
====================================
SEND RESULT
WhatsApp + Email
====================================
*/
export const sendResultToParent = async (req, res) => {
  try {
    const {
      phone,
      email,
      whatsapp,
      emailDelivery,
    } = req.body;

    const result = await Result.findOne({
      _id: req.params.id,
      school: req.school._id,
    })
      .populate("studentId")
      .populate("subjects");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    if (result.status !== "published") {
      return res.status(400).json({
        success: false,
        message:
          "Result must be published before sending.",
      });
    }

    const school = await School.findById(
      req.school._id
    );

    /*
    ==========================
    Generate PDF ONCE
    ==========================
    */

    const pdf = await generateResultPDF({
      school,

      result: {
        ...result.toObject(),

        studentName:
          result.studentId?.name,

        admissionNumber:
          result.studentId?.admissionNumber,

        studentPassport:
          result.studentId?.passport,
      },

      subjects:
        result.subjects || [],
    });

    /*
    ==========================
    Send WhatsApp
    ==========================
    */

    if (whatsapp) {
      await sendResultToParentWhatsApp({
        phone,
        pdfPath: pdf.filePath,

        studentName:
          result.studentId?.name,

        term: result.term,

        session: result.session,
      });
    }

    /*
    ==========================
    Send Email
    ==========================
    */

    if (emailDelivery) {
      await sendResultEmail({
        email,

        pdfPath: pdf.filePath,

        studentName:
          result.studentId?.name,

        schoolName:
          school?.name,
      });
    }

    /*
    ==========================
    Save Delivery Status
    ==========================
    */

    result.delivery = {
      whatsappSent:
        whatsapp || false,

      emailSent:
        emailDelivery || false,

      sentAt: new Date(),
    };

    await result.save();

    return res.status(200).json({
      success: true,
      message:
        "Result delivered successfully.",
    });
  } catch (error) {
    console.error(
      "SEND RESULT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};