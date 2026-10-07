import nodemailer from "nodemailer";
import fs from "fs";

/*
==================================================
EMAIL TRANSPORTER
==================================================
*/

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/*
==================================================
SEND RESULT EMAIL
==================================================
*/

export const sendResultEmail = async ({
  email,
  pdfPath,
  studentName,
  schoolName,
}) => {
  try {
    if (!email) {
      throw new Error("Parent email is required.");
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error("Result PDF not found.");
    }

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        process.env.EMAIL_USER,

      to: email,

      subject: `${schoolName} - Student Result`,

      html: `
      <div style="
        font-family:Arial;
        max-width:650px;
        margin:auto;
      ">

        <h2 style="color:#2563eb;">
          ${schoolName}
        </h2>

        <p>Dear Parent,</p>

        <p>

          Please find attached the report card for

          <strong>${studentName}</strong>.

        </p>

        <p>

          Kindly review the student's performance.

        </p>

        <br>

        <p>

          Regards,

          <br>

          <strong>${schoolName}</strong>

        </p>

        <hr>

        <small>

          Powered by SchoolBridge

        </small>

      </div>
      `,

      attachments: [
        {
          filename: `${studentName}-Result.pdf`,
          path: pdfPath,
        },
      ],
    });

    console.log(
      "EMAIL SENT TO:",
      email
    );

    return true;
  } catch (error) {
    console.error(
      "EMAIL SERVICE ERROR:",
      error
    );

    throw error;
  }
};