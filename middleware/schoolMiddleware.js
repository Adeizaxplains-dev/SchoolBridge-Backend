// ============================================================
// backend/middleware/schoolMiddleware.js
// SchoolBridge Enterprise
// School Context / Tenant Middleware
//
// Responsibilities:
// - Resolve authenticated school context
// - Validate school ID
// - Load school
// - Verify school exists
// - Verify school is active
// - Verify authenticated user belongs to the school
// - Attach normalized school context to req
//
// IMPORTANT:
// This middleware does NOT manage onboarding progress.
// Onboarding state belongs to:
//   services/onboarding/progressService.js
// ============================================================

import mongoose from "mongoose";

import School from "../models/School.js";

// ============================================================
// INTERNAL: GET SCHOOL ID
// ============================================================
//
// Supported sources are intentionally limited to authenticated
// tenant context and backward-compatible request properties.
//
// Priority:
// 1. req.user.school
// 2. req.schoolId
// 3. req.school when it is an ID
//
// A populated req.school document is handled separately.
// ============================================================

const getSchoolId = (req) => {
    if (req.user?.school) {
        return req.user.school;
    }

    if (req.schoolId) {
        return req.schoolId;
    }

    if (
        req.school &&
        typeof req.school !== "object"
    ) {
        return req.school;
    }

    return null;
};

// ============================================================
// INTERNAL: VALIDATE OBJECT ID
// ============================================================

const isValidSchoolId = (schoolId) => {
    return mongoose.Types.ObjectId.isValid(
        schoolId
    );
};

// ============================================================
// SCHOOL CONTEXT MIDDLEWARE
// ============================================================

export const schoolMiddleware = async (
    req,
    res,
    next
) => {

    try {

        let school = null;

        // ====================================================
        // EXISTING POPULATED SCHOOL CONTEXT
        // ====================================================

        if (
            req.school &&
            typeof req.school === "object" &&
            req.school._id
        ) {

            school = req.school;

        }

        // ====================================================
        // RESOLVE SCHOOL ID
        // ====================================================

        else {

            const schoolId =
                getSchoolId(req);

            // ------------------------------------------------
            // SCHOOL CONTEXT IS REQUIRED
            // ------------------------------------------------

            if (!schoolId) {

                return res.status(401).json({
                    success: false,
                    message:
                        "School context missing.",
                });

            }

            // ------------------------------------------------
            // VALIDATE SCHOOL ID
            // ------------------------------------------------

            if (
                !isValidSchoolId(
                    schoolId
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid school ID.",
                });

            }

            // ------------------------------------------------
            // LOAD SCHOOL
            // ------------------------------------------------

            school =
                await School.findById(
                    schoolId
                );

        }

        // ====================================================
        // SCHOOL MUST EXIST
        // ====================================================

        if (!school) {

            return res.status(404).json({
                success: false,
                message:
                    "School not found.",
            });

        }

        // ====================================================
        // NORMALIZE SCHOOL ID
        // ====================================================

        const resolvedSchoolId =
            school._id;

        // ====================================================
        // VERIFY AUTHENTICATED USER TENANT
        // ====================================================
        //
        // If the authenticated user already has a school
        // assigned, that school MUST match the resolved school.
        //
        // This prevents cross-school access.
        // ====================================================

        if (
            req.user?.school &&
            resolvedSchoolId.toString() !==
                req.user.school.toString()
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Unauthorized school access.",
            });

        }

        // ====================================================
        // VERIFY SCHOOL STATUS
        // ====================================================

        if (
            school.isActive === false
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "School account is inactive.",
            });

        }

        // ====================================================
        // ATTACH FINAL SCHOOL CONTEXT
        // ====================================================
        //
        // Controllers and services can now consistently use:
        //
        // req.school
        // req.schoolId
        //
        // This removes the need for each controller to query
        // or reconstruct school context.
        // ====================================================

        req.school =
            school;

        req.schoolId =
            resolvedSchoolId;

        // ====================================================
        // OPTIONAL DEBUG LOG
        // ====================================================

        if (
            process.env.NODE_ENV !==
            "production"
        ) {

            console.log(
                "SCHOOL CONTEXT:",
                {
                    schoolId:
                        resolvedSchoolId.toString(),

                    school:
                        school.name,

                    user:
                        req.user?._id?.toString() ||
                        null,
                }
            );

        }

        // ====================================================
        // CONTINUE
        // ====================================================

        return next();

    }

    catch (error) {

        console.error(
            "SCHOOL MIDDLEWARE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "School verification failed.",
        });

    }

};

// ============================================================
// REQUIRE SCHOOL OWNER
// ============================================================
//
// Requires:
// - authenticated user
// - admin role
// - explicit school-owner flag
//
// This middleware does not verify the school itself.
// schoolMiddleware should run before this middleware.
// ============================================================

export const schoolOwnerOnly = (
    req,
    res,
    next
) => {

    try {

        // ====================================================
        // AUTHENTICATION
        // ====================================================

        if (!req.user) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required.",
            });

        }

        // ====================================================
        // SCHOOL OWNER PERMISSION
        // ====================================================

        if (
            req.user.role !== "admin" ||
            req.user.isSchoolOwner !== true
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "School owner access required.",
            });

        }

        return next();

    }

    catch (error) {

        console.error(
            "SCHOOL OWNER MIDDLEWARE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Permission verification failed.",
        });

    }

};

// ============================================================
// REQUIRE ACTIVE SCHOOL SUBSCRIPTION
// ============================================================
//
// Allowed subscription states:
// - trial
// - active
//
// This is deliberately separate from schoolMiddleware so
// routes that should remain accessible during billing problems
// can use schoolMiddleware without this restriction.
// ============================================================

export const activeSchoolOnly = (
    req,
    res,
    next
) => {

    try {

        // ====================================================
        // SCHOOL CONTEXT REQUIRED
        // ====================================================

        if (!req.school) {

            return res.status(403).json({
                success: false,
                message:
                    "School context required.",
            });

        }

        // ====================================================
        // ALLOWED SUBSCRIPTION STATES
        // ====================================================

        const allowedStatuses = [
            "trial",
            "active",
        ];

        // ====================================================
        // VERIFY SUBSCRIPTION
        // ====================================================

        if (
            !allowedStatuses.includes(
                req.school.subscriptionStatus
            )
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "School subscription is inactive.",
                redirect:
                    "/admin/billing",
            });

        }

        return next();

    }

    catch (error) {

        console.error(
            "ACTIVE SCHOOL MIDDLEWARE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Subscription check failed.",
        });

    }

};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default schoolMiddleware;