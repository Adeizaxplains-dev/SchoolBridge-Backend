import mongoose from "mongoose";

const resultSubjectSchema =
  new mongoose.Schema(
    {
      /*
      ==================================
      MULTI-TENANT
      ==================================
      */

      school: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
        index: true,
      },

      /*
      ==================================
      RESULT
      ==================================
      */

      resultId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Result",
        required: true,
      },

      studentId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },

      /*
      ==================================
      SUBJECT
      ==================================
      */

      subject: {
        type: String,
        required: true,
        trim: true,
      },

      subjectCode: {
        type: String,
        default: "",
      },

      teacherId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      /*
      ==================================
      SCORES
      ==================================
      */

      ca1: {
        type: Number,
        default: 0,
        min: 0,
        max: 20,
      },

      ca2: {
        type: Number,
        default: 0,
        min: 0,
        max: 20,
      },

      ca3: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },

      assignment: {
        type: Number,
        default: 0,
      },

      project: {
        type: Number,
        default: 0,
      },

      exam: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      /*
      ==================================
      CALCULATED FIELDS
      ==================================
      */

      total: {
        type: Number,
        default: 0,
      },

      percentage: {
        type: Number,
        default: 0,
      },

      grade: {
        type: String,
        default: "F",
      },

      remark: {
        type: String,
        default: "Fail",
      },

      /*
      ==================================
      CLASS ANALYTICS
      ==================================
      */

      position: {
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
      ==================================
      COMMENTS
      ==================================
      */

      teacherComment: {
        type: String,
        default: "",
      },

      /*
      ==================================
      APPROVAL
      ==================================
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
      ==================================
      STATUS
      ==================================
      */

      status: {
        type: String,
        enum: [
          "draft",
          "submitted",
          "approved",
          "published",
        ],
        default: "draft",
      },
    },
    {
      timestamps: true,
    }
  );

/*
==================================
INDEXES
==================================
*/

resultSubjectSchema.index({
  school: 1,
  resultId: 1,
});

resultSubjectSchema.index({
  school: 1,
  studentId: 1,
});

resultSubjectSchema.index({
  school: 1,
  subject: 1,
});

export default mongoose.model(
  "ResultSubject",
  resultSubjectSchema
);