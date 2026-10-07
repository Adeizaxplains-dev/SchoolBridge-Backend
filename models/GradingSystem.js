import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    grade: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    minScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    maxScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    remark: {
      type: String,
      default: "",
      trim: true,
    },

    point: {
      type: Number,
      default: 0,
    },

    color: {
      type: String,
      default: "#2563eb",
    },
  },
  {
    _id: true,
  }
);

const gradingSystemSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    passMark: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },

    grades: {
      type: [gradeSchema],
      default: [],
    },

    isDefault: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/*
==========================================
VALIDATE GRADE RANGES
==========================================
*/

gradingSystemSchema.pre("save", function () {
  if (!this.grades.length) {
    return;
  }

  const sorted = [...this.grades].sort(
    (a, b) => a.minScore - b.minScore
  );

  for (let i = 0; i < sorted.length; i++) {
    const grade = sorted[i];

    if (grade.minScore > grade.maxScore) {
      throw new Error(`Invalid range for grade ${grade.grade}`);
    }

    if (i > 0) {
      const previous = sorted[i - 1];

      if (grade.minScore <= previous.maxScore) {
        throw new Error("Grade score ranges overlap.");
      }
    }
  }

});

/*
==========================================
UNIQUE
==========================================
*/

gradingSystemSchema.index({
  school: 1,
  name: 1,
});

export default mongoose.model(
  "GradingSystem",
  gradingSystemSchema
);