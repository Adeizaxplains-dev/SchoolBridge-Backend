import mongoose from "mongoose";

const gradingSchema =
  new mongoose.Schema(
    {
      grade: {
        type: String,
        required: true,
      },

      minScore: {
        type: Number,
        required: true,
      },

      maxScore: {
        type: Number,
        required: true,
      },

      remark: {
        type: String,
        required: true,
      },
    },
    { _id: false }
  );

const resultTemplateSchema =
  new mongoose.Schema(
    {
      school: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
        unique: true,
      },

      /*
      ===================================
      SCHOOL BRANDING
      ===================================
      */

      schoolName: String,

      schoolLogo: String,

      schoolAddress: String,

      schoolPhone: String,

      schoolEmail: String,

      website: String,

      resultTitle: {
        type: String,
        default:
          "Student Academic Report",
      },

      watermark: {
        type: String,
        default:
          "SchoolBridge",
      },

      /*
      ===================================
      SIGNATURES
      ===================================
      */

      principalName: String,

      principalSignature:
        String,

      teacherSignature:
        String,

      /*
      ===================================
      RESULT SETTINGS
      ===================================
      */

      showPosition: {
        type: Boolean,
        default: true,
      },

      showAttendance: {
        type: Boolean,
        default: true,
      },

      showClassAverage: {
        type: Boolean,
        default: true,
      },

      showTeacherRemark: {
        type: Boolean,
        default: true,
      },

      showPrincipalRemark: {
        type: Boolean,
        default: true,
      },

      /*
      ===================================
      CA CONFIGURATION
      ===================================
      */

      ca1Weight: {
        type: Number,
        default: 20,
      },

      ca2Weight: {
        type: Number,
        default: 20,
      },

      examWeight: {
        type: Number,
        default: 60,
      },

      /*
      ===================================
      GRADING SYSTEM
      ===================================
      */

      gradingSystem: {
        type: [gradingSchema],

        default: [
          {
            grade: "A",
            minScore: 70,
            maxScore: 100,
            remark: "Excellent",
          },

          {
            grade: "B",
            minScore: 60,
            maxScore: 69,
            remark: "Very Good",
          },

          {
            grade: "C",
            minScore: 50,
            maxScore: 59,
            remark: "Good",
          },

          {
            grade: "D",
            minScore: 45,
            maxScore: 49,
            remark: "Fair",
          },

          {
            grade: "E",
            minScore: 40,
            maxScore: 44,
            remark: "Pass",
          },

          {
            grade: "F",
            minScore: 0,
            maxScore: 39,
            remark: "Fail",
          },
        ],
      },

      /*
      ===================================
      PSYCHOMOTOR
      ===================================
      */

      psychomotorTraits: {
        type: [String],

        default: [
          "Handwriting",
          "Sports",
          "Creativity",
          "Leadership",
          "Neatness",
        ],
      },

      /*
      ===================================
      AFFECTIVE DOMAIN
      ===================================
      */

      affectiveTraits: {
        type: [String],

        default: [
          "Punctuality",
          "Honesty",
          "Respect",
          "Discipline",
          "Cooperation",
        ],
      },

      /*
      ===================================
      PDF SETTINGS
      ===================================
      */

      pdfTheme: {
        type: String,
        enum: [
          "classic",
          "modern",
          "minimal",
          "premium",
        ],
        default: "premium",
      },

      primaryColor: {
        type: String,
        default:
          "#2563eb",
      },

      secondaryColor: {
        type: String,
        default:
          "#0f172a",
      },

      /*
      ===================================
      WHATSAPP SETTINGS
      ===================================
      */

      autoSendToParents: {
        type: Boolean,
        default: false,
      },

      autoPublishResults: {
        type: Boolean,
        default: false,
      },

      /*
      ===================================
      STATUS
      ===================================
      */

      active: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "ResultTemplate",
  resultTemplateSchema
);