// ============================================================
// backend/middleware/authMiddleware.js
// SchoolBridge Enterprise
// Authentication Middleware
//
// Responsibilities:
// - Verify JWT
// - Load authenticated user
// - Verify user account status
// - Resolve user's school/tenant ID
// - Attach authentication context to req
// - Handle impersonation metadata
// - Provide role middleware
// - Provide completed-setup middleware
//
// IMPORTANT:
// This middleware authenticates the USER.
//
// School existence, school activity, and tenant ownership are
// enforced by schoolMiddleware.js.
//
// Route order should normally be:
//
// authMiddleware
//      ↓
// schoolMiddleware
//      ↓
// role middleware
//
// ============================================================

import jwt from "jsonwebtoken";

import User from "../models/User.js";

// ============================================================
// INTERNAL: GET JWT TOKEN
// ============================================================

const getTokenFromRequest = (req) => {

    const authHeader =
        req.headers.authorization;

    if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
    ) {

        return null;

    }

    const token =
        authHeader
            .slice(7)
            .trim();

    return token || null;
};

// ============================================================
// INTERNAL: RESOLVE USER SCHOOL ID
// ============================================================
//
// Current schema:
//   user.school
//
// Legacy schema:
//   user.schoolId
//
// Legacy JWT:
//   decoded.school
//
// Priority:
//   1. user.school
//   2. user.schoolId
//   3. decoded.school
//
// The authenticated user's database assignment takes priority
// over a school value supplied by the token.
// ============================================================

const resolveUserSchoolId = (
    user,
    decoded
) => {

    return (
        user?.school ||
        user?.schoolId ||
        decoded?.school ||
        null
    );

};

// ============================================================
// AUTHENTICATION
// ============================================================

export const authMiddleware = async (
    req,
    res,
    next
) => {

    try {

        // ====================================================
        // GET TOKEN
        // ====================================================

        const token =
            getTokenFromRequest(req);

        if (!token) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication token required.",
            });

        }

        // ====================================================
        // VERIFY TOKEN
        // ====================================================

        if (!process.env.JWT_SECRET) {

            console.error(
                "AUTH ERROR: JWT_SECRET is not configured."
            );

            return res.status(500).json({
                success: false,
                message:
                    "Authentication service is not configured.",
            });

        }

        let decoded;

        try {

            decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

        }
        catch (error) {

            console.error(
                "JWT VERIFICATION ERROR:",
                error.message
            );

            return res.status(401).json({
                success: false,
                message:
                    "Invalid or expired authentication token.",
            });

        }

        // ====================================================
        // VERIFY TOKEN PAYLOAD
        // ====================================================

        if (!decoded?.id) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid authentication token.",
            });

        }

        // ====================================================
        // FIND USER
        // ====================================================

        const user =
            await User.findById(
                decoded.id
            ).select(
                "-refreshToken"
            );

        if (!user) {

            return res.status(401).json({
                success: false,
                message:
                    "User account no longer exists.",
            });

        }

        // ====================================================
        // CHECK ACCOUNT STATUS
        // ====================================================

        if (
            user.status &&
            user.status !== "active"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "User account is not active.",
            });

        }

        // ====================================================
        // RESOLVE USER SCHOOL
        // ====================================================

        const schoolId =
            resolveUserSchoolId(
                user,
                decoded
            );

        // ====================================================
        // ATTACH USER CONTEXT
        // ====================================================
        //
        // Do not load the School document here.
        //
        // schoolMiddleware is responsible for resolving and
        // validating the actual school.
        // ====================================================

        req.user =
            user;

        req.userId =
            user._id;

        req.userRole =
            user.role;

        req.schoolId =
            schoolId || null;

        // ====================================================
        // IMPERSONATION CONTEXT
        // ====================================================

        req.isImpersonating =
            Boolean(
                decoded.impersonating
            );

        req.parentId =
            decoded.parentId ||
            null;

        req.teacherId =
            decoded.teacherId ||
            null;

        req.adminId =
            decoded.adminId ||
            null;

        // ====================================================
        // SUPERADMIN EXCEPTION
        // ====================================================
        //
        // Superadmins may operate without a school context
        // when performing platform-level operations.
        //
        // Regular school users must have a school.
        // ====================================================

        if (
            !schoolId &&
            user.role !== "superadmin"
        ) {

            console.error(
                "AUTH ERROR: School context missing.",
                {
                    userId:
                        user._id,

                    email:
                        user.email,

                    role:
                        user.role,
                }
            );

            return res.status(403).json({
                success: false,
                message:
                    "School context is required for this account.",
            });

        }

        // ====================================================
        // CONTINUE
        // ====================================================

        return next();

    }

    catch (error) {

        console.error(
            "AUTH MIDDLEWARE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Authentication verification failed.",
        });

    }

};

// ============================================================
// ROLE MIDDLEWARE
// ============================================================
//
// Usage:
//
// router.use(
//     roleMiddleware(["admin"])
// );
//
// ============================================================

export const roleMiddleware =
    (
        allowedRoles = []
    ) =>
    (
        req,
        res,
        next
    ) => {

        // ====================================================
        // AUTHENTICATION REQUIRED
        // ====================================================

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });

        }

        // ====================================================
        // NORMALIZE ALLOWED ROLES
        // ====================================================

        const roles =
            Array.isArray(
                allowedRoles
            )
                ? allowedRoles
                : [allowedRoles];

        // ====================================================
        // ADMIN IMPERSONATION
        // ====================================================
        //
        // Preserve the existing SchoolBridge behavior:
        // an admin performing an approved impersonation may
        // pass role checks for the impersonated portal.
        // ====================================================

        if (
            req.user.role === "admin" &&
            req.isImpersonating
        ) {

            return next();

        }

        // ====================================================
        // ROLE CHECK
        // ====================================================

        if (
            !roles.includes(
                req.user.role
            )
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Access denied for this role.",
            });

        }

        return next();

    };

// ============================================================
// ADMIN ONLY
// ============================================================

export const adminOnly = (
    req,
    res,
    next
) => {

    return roleMiddleware(
        [
            "admin",
            "superadmin",
        ]
    )(
        req,
        res,
        next
    );

};

// ============================================================
// TEACHER ONLY
// ============================================================

export const teacherOnly = (
    req,
    res,
    next
) => {

    return roleMiddleware(
        [
            "teacher",
        ]
    )(
        req,
        res,
        next
    );

};

// ============================================================
// PARENT ONLY
// ============================================================

export const parentOnly = (
    req,
    res,
    next
) => {

    return roleMiddleware(
        [
            "parent",
        ]
    )(
        req,
        res,
        next
    );

};

// ============================================================
// REQUIRE COMPLETED SCHOOL SETUP
// ============================================================
//
// This middleware should run AFTER:
//
// authMiddleware
// schoolMiddleware
//
// Example:
//
// router.use(authMiddleware);
// router.use(schoolMiddleware);
// router.use(requireCompletedSetup);
//
// IMPORTANT:
// onboarding routes themselves should NOT use this middleware,
// because the purpose of onboarding is to complete setup.
// ============================================================

export const requireCompletedSetup = (
    req,
    res,
    next
) => {

    try {

        // ====================================================
        // SCHOOL REQUIRED
        // ====================================================

        if (!req.school) {

            return res.status(403).json({
                success: false,
                message:
                    "School context required.",
            });

        }

        // ====================================================
        // CHECK COMPLETION
        // ====================================================
        //
        // Current canonical cache:
        //   onboardingCompleted
        //
        // Legacy compatibility:
        //   setupCompleted
        // ====================================================

        const completed =
            Boolean(
                req.school.onboardingCompleted ||
                req.school.setupCompleted
            );

        if (!completed) {

            return res.status(403).json({
                success: false,
                message:
                    "Complete school onboarding first.",
                redirect:
                    "/admin/school-setup/onboard",
            });

        }

        // ====================================================
        // CONTINUE
        // ====================================================

        return next();

    }

    catch (error) {

        console.error(
            "SETUP CHECK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Setup verification failed.",
        });

    }

};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default authMiddleware;