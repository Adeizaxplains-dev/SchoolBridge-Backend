// ============================================================
// backend/controllers/authController.js
// SchoolBridge - Authentication Controller
//
//   POST /api/auth/register   create school + owner admin
//   POST /api/auth/login      unified login (all roles)
//   GET  /api/auth/profile    current user + school
//   POST /api/auth/logout
// ============================================================

import jwt from "jsonwebtoken";

import User from "../models/User.js";
import School from "../models/School.js";

import {
    runInTransaction,
    sessionOpts,
} from "../utils/transaction.js";
import { getHomeRoute } from "../utils/homeRoute.js";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const httpError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const idOf = (value) => value?._id || value || null;

const generateToken = (user) =>
    jwt.sign(
        {
            id: user._id,
            role: user.role,
            // Always store the school ID only (never the document)
            school: idOf(user.school),
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );

const isOnboardingComplete = (school) =>
    Boolean(school?.onboardingCompleted || school?.setupCompleted);

// Consistent, frontend-friendly shapes. Both `id` and `_id` are
// returned so every consumer (axios interceptor, contexts, pages)
// can rely on either.
export const serializeUser = (user) => ({
    id: user._id,
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    profileImage: user.profileImage || "",
    role: user.role,
    isSchoolOwner: Boolean(user.isSchoolOwner),
    teacherId: user.teacherId || null,
    parentId: user.parentId || null,
    status: user.status,
    lastLogin: user.lastLogin || null,
});

export const serializeSchool = (school) => ({
    id: school._id,
    _id: school._id,
    name: school.name,
    code: school.code,
    slug: school.slug || "",
    logo: school.logo || "",
    email: school.email || "",
    phone: school.phone || "",
    onboardingCompleted: isOnboardingComplete(school),
    onboardingPercentage:
        school.onboardingPercentage ?? school.setupProgress ?? 0,
    currentSetupStep: school.currentSetupStep || "school_profile",
    subscriptionPlan: school.subscriptionPlan,
    subscriptionStatus: school.subscriptionStatus,
    trialEndsAt: school.trialEndsAt || null,
    isActive: school.isActive !== false,
    settings: school.settings || undefined,
});

const buildAuthResponse = (user, school, token) => {
    if (!school) {
        throw new Error("School information missing");
    }

    const serializedSchool = serializeSchool(school);

    return {
        success: true,
        token,
        user: serializeUser(user),
        school: serializedSchool,
        redirect: getHomeRoute(user.role, serializedSchool.onboardingCompleted),
    };
};

const SCHOOL_FIELDS =
    "name slug code logo email phone onboardingCompleted onboardingPercentage " +
    "setupProgress setupCompleted currentSetupStep subscriptionPlan " +
    "subscriptionStatus trialEndsAt isActive owner settings";

const respondError = (res, error, context) => {
    // Mongo duplicate key (unique email / slug / code)
    if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        const message =
            field === "email"
                ? "Email already exists."
                : "A school with these details already exists.";
        return res.status(409).json({ success: false, message });
    }

    if (error?.name === "ValidationError") {
        const message = Object.values(error.errors || {})
            .map((e) => e.message)
            .join(" ");
        return res.status(400).json({
            success: false,
            message: message || "Validation failed.",
        });
    }

    const status = error?.status || 500;

    if (status >= 500) {
        console.error(`${context} ERROR:`, error);
    }

    return res.status(status).json({
        success: false,
        message:
            status >= 500
                ? "Something went wrong. Please try again."
                : error.message,
    });
};

// ------------------------------------------------------------
// REGISTER SCHOOL
//
// Creates the School, the owner Admin user and links them.
// Uses a transaction when the database supports it (Atlas) and a
// compensating cleanup when it does not (local standalone mongod).
// ------------------------------------------------------------

const buildSchoolCode = (schoolName) =>
    (schoolName.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "SCH") +
    "-" +
    Math.floor(1000 + Math.random() * 9000);

export const registerSchool = async (req, res) => {
    let createdSchoolId = null;

    try {
        const { schoolName, email, password, phone, fullName } = req.body || {};

        if (!schoolName?.trim() || !email?.trim() || !password) {
            throw httpError(
                400,
                "School name, email and password are required."
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (!EMAIL_PATTERN.test(normalizedEmail)) {
            throw httpError(400, "Please enter a valid email address.");
        }

        if (String(password).length < 6) {
            throw httpError(400, "Password must be at least 6 characters.");
        }

        if (await User.exists({ email: normalizedEmail })) {
            throw httpError(409, "Email already exists.");
        }

        const cleanName = schoolName.trim();

        // Unique school code
        let code;
        do {
            code = buildSchoolCode(cleanName);
        } while (await School.exists({ code }));

        // Unique slug
        let slug = cleanName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

        if (!slug || (await School.exists({ slug }))) {
            slug = `${slug || "school"}-${Date.now()}`;
        }

        const { school, admin } = await runInTransaction(async (session) => {
            const [createdSchool] = await School.create(
                [
                    {
                        name: cleanName,
                        slug,
                        code,
                        email: normalizedEmail,
                        phone: phone || "",
                        subscriptionPlan: "trial",
                        subscriptionStatus: "trial",
                        onboardingCompleted: false,
                        onboardingPercentage: 0,
                        currentSetupStep: "school_profile",
                    },
                ],
                sessionOpts(session)
            );

            // remember for cleanup when running without a transaction
            createdSchoolId = session ? null : createdSchool._id;

            const [createdAdmin] = await User.create(
                [
                    {
                        fullName: fullName?.trim() || cleanName,
                        email: normalizedEmail,
                        password,
                        phone: phone || "",
                        role: "admin",
                        school: createdSchool._id,
                        isSchoolOwner: true,
                        onboardingCompleted: false,
                        lastOnboardingStep: "school_profile",
                    },
                ],
                sessionOpts(session)
            );

            createdSchool.owner = createdAdmin._id;
            await createdSchool.save(sessionOpts(session));

            return { school: createdSchool, admin: createdAdmin };
        });

        createdSchoolId = null;

        return res
            .status(201)
            .json(buildAuthResponse(admin, school, generateToken(admin)));
    } catch (error) {
        // Compensating cleanup (only needed when no transaction was used)
        if (createdSchoolId) {
            await School.findByIdAndDelete(createdSchoolId).catch(() => {});
        }

        return respondError(res, error, "REGISTER");
    }
};

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            throw httpError(400, "Email and password are required.");
        }

        const user = await User.findOne({
            email: String(email).toLowerCase().trim(),
        })
            .select("+password")
            .populate({ path: "school", select: SCHOOL_FIELDS });

        // Same message for unknown email and wrong password
        if (!user || !(await user.comparePassword(password))) {
            throw httpError(401, "Invalid email or password.");
        }

        if (user.status === "inactive") {
            throw httpError(403, "Account is inactive.");
        }

        if (user.status === "suspended" || user.status === "locked") {
            throw httpError(403, "Account has been suspended.");
        }

        if (!user.school) {
            console.error("AUTH ERROR: user has no school", {
                userId: user._id,
            });
            throw httpError(
                404,
                "School account not found. Contact administrator."
            );
        }

        if (user.school.isActive === false) {
            throw httpError(403, "School account has been disabled.");
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(buildAuthResponse(user, user.school, generateToken(user)));
    } catch (error) {
        return respondError(res, error, "LOGIN");
    }
};

// ------------------------------------------------------------
// PROFILE   GET /api/auth/profile
// ------------------------------------------------------------

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({ path: "school", select: SCHOOL_FIELDS })
            .select("-password -refreshToken");

        if (!user) {
            throw httpError(404, "User not found.");
        }

        if (!user.school) {
            throw httpError(404, "School not found for this user.");
        }

        const school = serializeSchool(user.school);

        return res.status(200).json({
            success: true,
            user: serializeUser(user),
            school,
            redirect: getHomeRoute(user.role, school.onboardingCompleted),
        });
    } catch (error) {
        return respondError(res, error, "PROFILE");
    }
};

// ------------------------------------------------------------
// LOGOUT (JWT is stateless - the client discards the token)
// ------------------------------------------------------------

export const logoutUser = async (req, res) =>
    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });

export default {
    registerSchool,
    loginUser,
    getProfile,
    logoutUser,
};
