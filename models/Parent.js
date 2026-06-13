import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const parentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: String,

    password: {
      type: String,
      required: true,
    },

    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

parentSchema.pre("save", async function (next) {
  if (!this.isModified("password"))
    return next();

  this.password = await bcrypt.hash(
    this.password,
    10
  );

  next();
});

export default mongoose.model(
  "Parent",
  parentSchema
);