import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const teacherSchema = new mongoose.Schema(
  {
    /*
    ========================================
    MULTI TENANT
    ========================================
    */

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    /*
    ========================================
    LINKED USER ACCOUNT
    ========================================
    */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    ========================================
    BASIC INFORMATION
    ========================================
    */

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    ========================================
    AUTHENTICATION
    ========================================
    */

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    /*
    ========================================
    PERSONAL DETAILS
    ========================================
    */

    gender: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male",
    },

    dateOfBirth: Date,

    passport: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    ========================================
    STAFF DETAILS
    ========================================
    */

    staffId: {
      type: String,
      default: "",
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    designation: {
      type: String,
      default: "Teacher",
      trim: true,
    },

    qualification: {
      type: String,
      default: "",
      trim: true,
    },

    employmentDate: Date,

    /*
    ========================================
    CLASS MANAGEMENT
    ========================================
    */

    classTeacherOf: {
      type: String,
      default: "",
    },

    classes: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    ========================================
    SUBJECTS
    ========================================
    */

    subjects: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    ========================================
    EXPERIENCE
    ========================================
    */

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    /*
    ========================================
    EMPLOYMENT
    ========================================
    */

    employmentType: {
      type: String,
      enum: [
        "Full Time",
        "Part Time",
        "Contract",
      ],
      default: "Full Time",
    },

    /*
    ========================================
    PERMISSIONS
    ========================================
    */

    permissions: {
      canTakeAttendance: {
        type: Boolean,
        default: true,
      },

      canUploadResults: {
        type: Boolean,
        default: true,
      },

      canCreateAssignments: {
        type: Boolean,
        default: true,
      },

      canSendMessages: {
        type: Boolean,
        default: true,
      },
    },

    /*
    ========================================
    STATUS
    ========================================
    */

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "suspended",
      ],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
==================================================
INDEXES
==================================================
*/

teacherSchema.index({
  school: 1,
  fullName: 1,
});

teacherSchema.index(
  {
    school: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

teacherSchema.index(
  {
    school: 1,
    email: 1,
  },
  {
    unique: true,
  }
);

teacherSchema.index(
  {
    school: 1,
    staffId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

teacherSchema.index({
  school: 1,
  status: 1,
});

teacherSchema.index({
  school: 1,
  department: 1,
});

/*
==================================================
HASH PASSWORD
==================================================
*/

teacherSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  this.passwordChangedAt = new Date();
});

/*
==================================================
COMPARE PASSWORD
==================================================
*/

teacherSchema.methods.comparePassword =
  async function (candidatePassword) {
    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

/*
==================================================
REMOVE PASSWORD FROM JSON
==================================================
*/

teacherSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;

  return obj;
};

export default mongoose.model(
  "Teacher",
  teacherSchema
);