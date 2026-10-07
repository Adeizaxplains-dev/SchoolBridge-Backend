import mongoose from "mongoose";

const parentSchema = new mongoose.Schema(
  {
    /*
    ==========================================
    MULTI TENANT
    ==========================================
    */

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    /*
    ==========================================
    LINKED USER ACCOUNT
    ==========================================
    */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
    ==========================================
    PROFILE
    ==========================================
    */

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    occupation: {
      type: String,
      default: "",
      trim: true,
    },

    relationship: {
      type: String,
      enum: [
        "Father",
        "Mother",
        "Guardian",
        "Other",
      ],
      default: "Guardian",
    },

    /*
    ==========================================
    CHILDREN
    ==========================================
    */

    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    /*
    ==========================================
    STATUS
    ==========================================
    */

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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

// Fast lookup of parents by school
parentSchema.index({
  school: 1,
  fullName: 1,
});

// Ensure one User account only has one Parent profile
// within the same school
parentSchema.index(
  {
    school: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

// Fast lookup by children
parentSchema.index({
  children: 1,
});

export default mongoose.model(
  "Parent",
  parentSchema
);