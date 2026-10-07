import fs from "fs";
import Result from "../models/Result.js";
import Student from "../models/Student.js";
import School from "../models/School.js";
import { generateResultPDF } from "./resultPDFService.js";

/*
=====================================================
SCHOOLBRIDGE WHATSAPP RESULT SERVICE
=====================================================
*/

export const sendResultToParentWhatsApp = async (resultId) => {
  try {
    /*
    =====================================
    LOAD RESULT
    =====================================
    */

    const result = await Result.findById(resultId)
      .populate("studentId")
      .populate("school")
      .populate("subjects");

    if (!result) {
      throw new Error("Result not found");
    }

    const student = result.studentId;
    const school = result.school;

    if (!student) {
      throw new Error("Student not found");
    }

    /*
    =====================================
    PARENT PHONE
    =====================================
    */

    const parentPhone =
      student.parentPhone ||
      student.guardianPhone ||
      student.phone;

    if (!parentPhone) {
      throw new Error("Parent phone not found");
    }

    /*
    =====================================
    GENERATE PDF
    =====================================
    */

    const pdf = await generateResultPDF({
      school,
      result: {
        ...result.toObject(),

        studentName: student.name,
        admissionNumber:
          student.admissionNumber,

        studentPassport:
          student.passport,
      },

      subjects: result.subjects || [],
    });

    /*
    =====================================
    MESSAGE
    =====================================
    */

    let subjectSummary = "";

    if (result.subjects?.length) {
      subjectSummary =
        "\n\n📚 Subjects\n\n" +
        result.subjects
          .map(
            (s) =>
              `${s.subject}: ${s.total} (${s.grade})`
          )
          .join("\n");
    }

    const body = `
🏫 ${school.name}

RESULT RELEASED

👨‍🎓 Student:
${student.name}

🏫 Class:
${result.className}

📚 ${result.term}

📅 ${result.session}

📊 Total:
${result.totalScore}

📈 Average:
${Number(result.average).toFixed(2)}

📌 Percentage:
${Number(result.percentage).toFixed(2)}%

🏅 Position:
${result.position || "-"}

👨‍🏫 Teacher Remark
${result.teacherRemark || "-"}

🏫 Principal Remark
${result.principalRemark || "-"}

${subjectSummary}
`;

    /*
    ===================================================
    TWILIO EXAMPLE
    ===================================================

    await client.messages.create({
        from:"whatsapp:+14155238886",
        to:`whatsapp:${parentPhone}`,
        body,
        mediaUrl:[
           `${process.env.SERVER_URL}/uploads/results/${pdf.fileName}`
        ]
    });

    */

    /*
    ===================================================
    META CLOUD API EXAMPLE

    axios.post(...)

    document:{
        link:`${process.env.SERVER_URL}/uploads/results/${pdf.fileName}`,
        filename:pdf.fileName
    }

    ===================================================
    */

    console.log("WhatsApp Ready");
    console.log(parentPhone);

    return {
      success: true,
      phone: parentPhone,
      pdf: `/uploads/results/${pdf.fileName}`,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

/*
=====================================================
BULK SEND
=====================================================
*/

export const sendBulkResultsToParents = async (
  resultIds = []
) => {
  const sent = [];

  for (const id of resultIds) {
    const r =
      await sendResultToParentWhatsApp(id);

    sent.push(r);
  }

  return {
    success: true,
    totalSent: sent.length,
  };
};