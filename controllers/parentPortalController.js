import Parent from "../models/Parent.js";
import Student from "../models/Student.js";

/*
==========================================================
GET LOGGED-IN PARENT (REAL OR IMPERSONATED)
==========================================================
*/
const getLoggedInParent = async (req) => {
  try {
    // =========================
    // REAL PARENT LOGIN
    // =========================
    if (req.user.role === "parent") {
      const parent = await Parent.findOne({
        _id: req.user._id,
        school: req.school,
      }).populate("children");

      if (!parent) {
        throw new Error("Parent account not found.");
      }

      return parent;
    }

    // =========================
    // ADMIN IMPERSONATION
    // =========================
    if (req.user.role === "admin") {
      const parentId =
        req.parentId || req.query.parentId;

      if (!parentId) {
        throw new Error(
          "Admin is not impersonating any parent."
        );
      }

      const parent = await Parent.findOne({
        _id: parentId,
        school: req.school,
      }).populate("children");

      if (!parent) {
        throw new Error("Parent account not found.");
      }

      return parent;
    }

    throw new Error("Access denied.");
  } catch (error) {
    throw error;
  }
};

/*
==========================================================
PARENT DASHBOARD
==========================================================
*/
export const getParentDashboard = async (req, res) => {
  try {
    const parent = await getLoggedInParent(req);

    const children = parent.children || [];

    /*
    ==========================================
    OUTSTANDING FEES (BASIC LOGIC)
    ==========================================
    */
    const outstandingFees = children.reduce(
      (sum, child) => {
        if (child.feeStatus === "unpaid")
          return sum + 5000;
        if (child.feeStatus === "partial")
          return sum + 2000;
        return sum;
      },
      0
    );

    /*
    ==========================================
    PLACEHOLDER DATA (SAFE EXTENSION ZONES)
    ==========================================
    */
    const results = [];
    const attendance = [];
    const unreadNotices = 0;

    return res.json({
      success: true,
      data: {
        parent: {
          _id: parent._id,
          fullName: parent.fullName,
          email: parent.email,
          phone: parent.phone,
        },

        children,

        outstandingFees,

        results,

        attendance,

        unreadNotices,
      },
    });
  } catch (error) {
    console.error(
      "PARENT DASHBOARD ERROR:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==========================================================
GET CHILDREN
==========================================================
*/
export const getParentChildren = async (req, res) => {
  try {
    const parent = await getLoggedInParent(req);

    return res.json({
      success: true,
      data: parent.children || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==========================================================
GET FEES
==========================================================
*/
export const getParentFees = async (req, res) => {
  try {
    const parent = await getLoggedInParent(req);

    const fees = (parent.children || []).map(
      (child) => ({
        studentId: child._id,
        name: child.name,
        class: child.class,
        feeStatus: child.feeStatus,
        estimatedBalance:
          child.feeStatus === "unpaid"
            ? 5000
            : child.feeStatus === "partial"
            ? 2000
            : 0,
      })
    );

    return res.json({
      success: true,
      data: fees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==========================================================
ATTENDANCE (PLACEHOLDER)
==========================================================
*/
export const getParentAttendance = async (req, res) => {
  try {
    const parent = await getLoggedInParent(req);

    return res.json({
      success: true,
      data: {
        children: parent.children || [],
        attendance: [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==========================================================
RESULTS (PLACEHOLDER)
==========================================================
*/
export const getParentResults = async (req, res) => {
  try {
    const parent = await getLoggedInParent(req);

    return res.json({
      success: true,
      data: {
        children: parent.children || [],
        results: [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==========================================================
MESSAGES (PLACEHOLDER)
==========================================================
*/
export const getParentMessages = async (req, res) => {
  try {
    const parent = await getLoggedInParent(req);

    return res.json({
      success: true,
      data: {
        messages: [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};