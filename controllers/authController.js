import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import School from "../models/School.js";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

/*
=====================================
REGISTER SCHOOL
=====================================
*/

export const registerSchool = async (req, res) => {
  try {
    const {
      schoolName,
      email,
      password,
      phone,
    } = req.body;

    if (
      !schoolName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const schoolCode =
      schoolName
        .substring(0, 3)
        .toUpperCase() +
      "-" +
      Math.floor(
        1000 + Math.random() * 9000
      );

    const trialEndsAt = new Date();

    trialEndsAt.setDate(
      trialEndsAt.getDate() + 14
    );

    const school = await School.create({
      name: schoolName,
      code: schoolCode,
      phone,

      subscriptionPlan: "Trial",

      trialEndsAt,

      maxStudents: 100,

      isActive: true,
    });

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      school: school._id,
      name: "School Administrator",
      email,
      password: hashedPassword,
      role: "admin",
    });

    const token =
      generateToken(user._id);

    res.status(201).json({
      success: true,

      token,

      school: {
        id: school._id,
        name: school.name,
        code: school.code,
        trialEndsAt:
          school.trialEndsAt,
      },

      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
=====================================
LOGIN
=====================================
*/

export const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({
        email,
      }).populate("school");

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid credentials",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid credentials",
      });
    }

    const token =
      generateToken(user._id);

    res.json({
      success: true,

      token,

      school: {
        id: user.school._id,
        name: user.school.name,
        code: user.school.code,
        subscriptionPlan:
          user.school.subscriptionPlan,
      },

      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
=====================================
PROFILE
=====================================
*/

export const getProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        )
          .populate("school")
          .select("-password");

      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

/*
=====================================
LOGOUT
=====================================
*/

export const logoutUser =
  async (req, res) => {
    res.json({
      success: true,
      message:
        "Logged out successfully",
    });
  };