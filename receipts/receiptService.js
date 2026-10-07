import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateReceipt = async ({
  receiptNumber,
  studentName,
  invoiceNumber,
  amount,
  paymentMethod,
  schoolName,
}) => {
  const receiptsDir = "receipts";

  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
  }

  const fileName = `${receiptNumber}.pdf`;

  const filePath = path.join(
    receiptsDir,
    fileName
  );

  const doc = new PDFDocument();

  doc.pipe(
    fs.createWriteStream(filePath)
  );

  doc.fontSize(22)
    .text(
      `${schoolName}`,
      { align: "center" }
    );

  doc.moveDown();

  doc.fontSize(18)
    .text(
      "PAYMENT RECEIPT",
      { align: "center" }
    );

  doc.moveDown();

  doc.fontSize(12);

  doc.text(
    `Receipt Number: ${receiptNumber}`
  );

  doc.text(
    `Student: ${studentName}`
  );

  doc.text(
    `Invoice: ${invoiceNumber}`
  );

  doc.text(
    `Amount Paid: ₦${amount}`
  );

  doc.text(
    `Method: ${paymentMethod}`
  );

  doc.text(
    `Date: ${new Date().toLocaleString()}`
  );

  doc.moveDown();

  doc.text(
    "Thank you for your payment."
  );

  doc.end();

  return filePath;
};