import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateReceiptNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(
    100000 + Math.random() * 900000
  );

  return `SBR-${year}-${random}`;
};

export const generateReceipt = async ({
  schoolName,
  studentName,
  invoiceNumber,
  amount,
  paymentMethod,
}) => {
  const receiptNumber =
    generateReceiptNumber();

  const receiptsDir = "receipts";

  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir);
  }

  const filePath = path.join(
    receiptsDir,
    `${receiptNumber}.pdf`
  );

  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text(
    schoolName,
    { align: "center" }
  );

  doc.moveDown();

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

  doc.end();

  return {
    receiptNumber,
    filePath,
  };
};