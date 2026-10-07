import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export const generateResultPDF = async ({
  school,
  result,
  subjects = [],
}) => {
  try {
    const uploadDir = path.join(
      process.cwd(),
      "uploads",
      "results"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {
        recursive: true,
      });
    }

    console.log(
      "PDF RESULT:",
      JSON.stringify(result, null, 2)
    );

    console.log(
      "PDF SUBJECTS:",
      JSON.stringify(subjects, null, 2)
    );

    const subjectRows = subjects
      .map((sub) => {
        const subjectName =
          sub.subject?.name ||
          sub.subject ||
          "N/A";

        return `
          <tr>
            <td>${subjectName}</td>
            <td>${sub.ca1 ?? 0}</td>
            <td>${sub.ca2 ?? 0}</td>
            <td>${sub.ca3 ?? 0}</td>
            <td>${sub.exam ?? 0}</td>
            <td>${sub.total ?? 0}</td>
            <td>${sub.grade ?? ""}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />

      <style>
        body{
          font-family: Arial, sans-serif;
          padding:30px;
          color:#333;
        }

        .header{
          text-align:center;
          border-bottom:2px solid #000;
          padding-bottom:10px;
          margin-bottom:20px;
        }

        .school-name{
          font-size:24px;
          font-weight:bold;
          text-transform:uppercase;
        }

        .student-section{
          display:flex;
          justify-content:space-between;
          margin-bottom:20px;
        }

        .passport{
          width:100px;
          height:100px;
          border-radius:10px;
          object-fit:cover;
          border:1px solid #ddd;
        }

        table{
          width:100%;
          border-collapse:collapse;
          margin-top:20px;
        }

        table,
        th,
        td{
          border:1px solid #000;
        }

        th,
        td{
          padding:8px;
          text-align:center;
        }

        .summary{
          margin-top:20px;
          border:1px solid #000;
          padding:15px;
        }

        .remarks{
          margin-top:20px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:20px;
        }

        .box{
          border:1px solid #000;
          padding:10px;
          min-height:80px;
        }

        .footer{
          text-align:center;
          margin-top:40px;
          font-size:12px;
          color:#666;
        }
      </style>
    </head>

    <body>

      <div class="header">
        <div class="school-name">
          ${school?.name || ""}
        </div>

        <div>
          ${school?.address || ""}
        </div>

        <h2>Student Report Card</h2>
      </div>

      <div class="student-section">

        <div>

          <p>
            <strong>Name:</strong>
            ${result?.studentName || ""}
          </p>

          <p>
            <strong>Admission No:</strong>
            ${result?.admissionNumber || ""}
          </p>

          <p>
            <strong>Class:</strong>
            ${result?.className || ""}
          </p>

          <p>
            <strong>Term:</strong>
            ${result?.term || ""}
          </p>

          <p>
            <strong>Session:</strong>
            ${result?.session || ""}
          </p>

          <p>
            <strong>Position:</strong>
            ${result?.position || "-"}
          </p>

        </div>

        <div>
          ${
            result?.studentPassport
              ? `
                <img
                  src="${result.studentPassport}"
                  class="passport"
                />
              `
              : ""
          }
        </div>

      </div>

      <table>

        <thead>
          <tr>
            <th>Subject</th>
            <th>CA1</th>
            <th>CA2</th>
            <th>CA3</th>
            <th>Exam</th>
            <th>Total</th>
            <th>Grade</th>
          </tr>
        </thead>

        <tbody>
          ${subjectRows}
        </tbody>

      </table>

      <div class="summary">

        <p>
          <strong>Total Score:</strong>
          ${result?.totalScore ?? 0}
        </p>

        <p>
          <strong>Average:</strong>
          ${Number(
            result?.average ?? 0
          ).toFixed(2)}
        </p>

        <p>
          <strong>Percentage:</strong>
          ${Number(
            result?.percentage ?? 0
          ).toFixed(2)}%
        </p>

      </div>

      <div class="remarks">

        <div class="box">
          <strong>Teacher Remark</strong>
          <br /><br />
          ${
            result?.teacherRemark ||
            "No remark"
          }
        </div>

        <div class="box">
          <strong>Principal Remark</strong>
          <br /><br />
          ${
            result?.principalRemark ||
            "No remark"
          }
        </div>

      </div>

      <div class="footer">
        Generated by SchoolBridge SaaS
      </div>

    </body>
    </html>
    `;

    const browser =
      await puppeteer.launch({
        headless: true,
      });

    const page =
      await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    const fileName =
      `${result._id}.pdf`;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return {
      filePath,
      fileName,
    };
  } catch (error) {
    console.error(
      "PDF GENERATION ERROR:",
      error
    );

    throw error;
  }
};

export const buildResultPDFBuffer =
  async (data) => {
    const pdf =
      await generateResultPDF(data);

    return fs.readFileSync(
      pdf.filePath
    );
  };
