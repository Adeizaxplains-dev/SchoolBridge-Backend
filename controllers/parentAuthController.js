import Parent from "../models/Parent.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const parentLogin = async (
  req,
  res
) => {
  try {
    const { email, password } = req.body;

    const parent = await Parent.findOne({
      email,
    });

    if (!parent) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(
      password,
      parent.password
    );

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: parent._id,
        role: "parent",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      parent,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};