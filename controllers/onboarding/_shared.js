// Shared helpers for the school-setup CRUD controllers.
import mongoose from "mongoose";

export const schoolIdOf = (req) =>
    req.school?._id || req.schoolId || req.user?.school?._id || req.user?.school;

export const ok = (res, message, data = null, status = 200, extra = {}) =>
    res.status(status).json({ success: true, message, data, ...extra });

export const fail = (res, message, status = 400) =>
    res.status(status).json({ success: false, message });

export const isId = (v) => mongoose.Types.ObjectId.isValid(String(v || ""));

// "" / undefined / "null" -> null, valid id -> id
export const idOrNull = (v) => (v && isId(v) ? v : null);

export const handleError = (res, error, label) => {
    if (error?.code === 11000) {
        return fail(res, `${label} already exists.`, 409);
    }
    if (error?.name === "ValidationError") {
        return fail(
            res,
            Object.values(error.errors).map((e) => e.message).join(" "),
            400
        );
    }
    if (error?.name === "CastError") {
        return fail(res, `Invalid ${error.path}.`, 400);
    }
    console.error(`${label} ERROR:`, error);
    return fail(res, `Failed to process ${label.toLowerCase()}.`, 500);
};
