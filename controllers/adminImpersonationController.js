import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Parent from "../models/Parent.js";

/*
==========================================================
ADMIN IMPERSONATE PARENT
POST /api/admin/impersonate/:parentId
==========================================================
*/

export const impersonateParent = async (req, res) => {
  try {
    // =========================
    // AUTH CHECK
    // =========================
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can impersonate parents.",
      });
    }

    // Prevent nested impersonation
    if (req.user.impersonating) {
      return res.status(400).json({
        success: false,
        message: "You are already impersonating a parent.",
      });
    }

    // =========================
    // VERIFY ADMIN
    // =========================
    const admin = await User.findOne({
      _id: req.user._id,
      school: req.school,
      role: "admin",
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    // =========================
    // FIND PARENT
    // =========================
    const parent = await Parent.findOne({
      _id: req.params.parentId,
      school: req.school,
    });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found.",
      });
    }

    // =========================
    // CREATE IMPERSONATION TOKEN
    // =========================
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        school: admin.school,

        // IMPORTANT FLAGS
        impersonating: true,
        parentId: parent._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    return res.status(200).json({
      success: true,
      message: `Now viewing ${parent.fullName}'s portal.`,
      token,
      parent: {
        _id: parent._id,
        fullName: parent.fullName,
        email: parent.email,
      },
    });

  } catch (error) {
    console.error("IMPERSONATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to start impersonation.",
    });
  }
};

/*
==========================================================
STOP IMPERSONATION
POST /api/admin/stop-impersonation
==========================================================
*/

export const stopImpersonation = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can stop impersonation.",
      });
    }

    const token = jwt.sign(
      {
        id: req.user._id,
        role: req.user.role,
        school: req.school,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Returned to administrator account.",
      token,
    });

  } catch (error) {
    console.error("STOP IMPERSONATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to stop impersonation.",
    });
  }
};