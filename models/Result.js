import mongoose from "mongoose";

const traitSchema = new mongoose.Schema(
  {
    name: String,
    score: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
    },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    /*
    =====================================
    MULTI TENANT
    =====================================
    */

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    /*
    =====================================
    STUDENT
    =====================================
    */

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    studentName: String,

    admissionNumber: String,

    studentPassport: String,

    /*
    =====================================
    ACADEMIC SESSION
    =====================================
    */

    className: {
      type: String,
      required: true,
    },

    arm: String,

    term: {
      type: String,
      enum: [
        "First Term",
        "Second Term",
        "Third Term",
      ],
      required: true,
    },

    session: {
      type: String,
      required: true,
    },

    /*
    =====================================
    SUBJECTS
    =====================================
    */

    subjects: [
      {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "ResultSubject",
      },
    ],

    totalSubjects: {
      type: Number,
      default: 0,
    },

    /*
    =====================================
    RESULT SUMMARY
    =====================================
    */

    totalScore: {
      type: Number,
      default: 0,
    },

    obtainableScore: {
      type: Number,
      default: 0,
    },

    average: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    grade: {
      type: String,
      default: "",
    },

    /*
    =====================================
    POSITION
    =====================================
    */

    position: {
      type: Number,
      default: 0,
    },

    classSize: {
      type: Number,
      default: 0,
    },

    highestScore: {
      type: Number,
      default: 0,
    },

    lowestScore: {
      type: Number,
      default: 0,
    },

    classAverage: {
      type: Number,
      default: 0,
    },

    /*
    =====================================
    ATTENDANCE
    =====================================
    */

    daysSchoolOpened: {
      type: Number,
      default: 0,
    },

    daysPresent: {
      type: Number,
      default: 0,
    },

    daysAbsent: {
      type: Number,
      default: 0,
    },

    attendanceRate: {
      type: Number,
      default: 0,
    },

    /*
    =====================================
    PSYCHOMOTOR
    =====================================
    */

    psychomotor: {
      type: [traitSchema],
      default: [],
    },

    /*
    =====================================
    AFFECTIVE DOMAIN
    =====================================
    */

    affectiveDomain: {
      type: [traitSchema],
      default: [],
    },

    /*
    =====================================
    REMARKS
    =====================================
    */

    teacherRemark: {
      type: String,
      default: "",
    },

    principalRemark: {
      type: String,
      default: "",
    },

    /*
    =====================================
    APPROVAL WORKFLOW
    =====================================
    */

    approved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    /*
    =====================================
    PUBLICATION
    =====================================
    */

    status: {
      type: String,
      enum: [
        "draft",
        "approved",
        "published",
      ],
      default: "draft",
    },

    publishedAt: Date,

    publishedToParents: {
      type: Boolean,
      default: false,
    },

    whatsappSent: {
      type: Boolean,
      default: false,
    },

    pdfUrl: String,
  },
  {
    timestamps: true,
  }
);

/*
=====================================
INDEXES
=====================================
*/

resultSchema.index({
  school: 1,
  studentId: 1,
  session: 1,
  term: 1,
});

resultSchema.index({
  school: 1,
  className: 1,
  session: 1,
  term: 1,
});

export default mongoose.model(
  "Result",
  resultSchema
);