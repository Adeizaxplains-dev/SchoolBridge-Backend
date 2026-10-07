// ============================================================
// backend/controllers/onboarding/onboardingController.js
// SchoolBridge Enterprise
// Onboarding Controller
// ============================================================

import {
    getStatus as getProgressStatus,
    getProgressSummary,
    refreshProgress as refreshProgressService,
    getOrCreateOnboarding,
    refreshOnboardingState,
    skipStep as skipStepService,
    unskipStep as unskipStepService,
    finishOnboarding as finishOnboardingService,
    resetOnboarding as resetOnboardingService,
} from "../../services/onboarding/progressService.js";

import {
    ONBOARDING_STATUS,
    ONBOARDING_STEPS,
    STEP_SEQUENCE,
} from "../../services/onboarding/constants.js";

import {
    setupSchoolProfile,
    createSchoolProfile,
} from "../../services/onboarding/schoolProfileService.js";

import {
    setupAcademicSession,
} from "../../services/onboarding/academicSessionService.js";

import {
    setupTerms,
} from "../../services/onboarding/termService.js";

import {
    setupClasses,
} from "../../services/onboarding/classService.js";

import {
    setupClassArms,
} from "../../services/onboarding/classArmService.js";

import {
    setupSubjects,
} from "../../services/onboarding/subjectService.js";

import {
    setupDepartments,
} from "../../services/onboarding/departmentService.js";

import {
    setupHouses,
} from "../../services/onboarding/houseService.js";

import {
    setupFeeStructure,
} from "../../services/onboarding/feeStructureService.js";

import {
    setupGradingSystem,
} from "../../services/onboarding/gradingSystemService.js";

import School from "../../models/School.js";
import User from "../../models/User.js";


// ============================================================
// HELPERS
// ============================================================

/**
 * Resolve the authenticated school's ID.
 *
 * School context should normally be populated by the
 * authentication / school-context middleware.
 *
 * Fallbacks are retained for backward compatibility.
 */
const getSchoolId = (req) => {

    const schoolId =
        req.school?._id ||
        req.schoolId ||
        req.user?.school;

    return schoolId || null;
};


// ============================================================
// SUCCESS RESPONSE
// ============================================================

/**
 * Standard success response.
 *
 * Existing frontend consumers expect:
 *
 * {
 *     success: true,
 *     message: "...",
 *     data: ...
 * }
 */
const success = (
    res,
    message,
    data = null,
    statusCode = 200
) => {

    return res.status(statusCode).json({

        success: true,

        message,

        ...(data !== null
            ? { data }
            : {}),

    });

};


// ============================================================
// ERROR STATUS
// ============================================================

/**
 * Determine an appropriate HTTP status for common
 * application errors.
 */
const getErrorStatus = (error) => {

    if (!error) {
        return 500;
    }

    if (
        Number.isInteger(
            error.statusCode
        )
    ) {

        return error.statusCode;

    }

    const message =
        String(
            error.message || ""
        ).toLowerCase();


    if (
        message.includes("not found")
    ) {

        return 404;

    }


    if (
        message.includes("required") ||
        message.includes("invalid") ||
        message.includes("already exists") ||
        message.includes("duplicate") ||
        message.includes("must be") ||
        message.includes("cannot") ||
        message.includes("not allowed")
    ) {

        return 400;

    }


    return 500;

};


// ============================================================
// FAILURE RESPONSE
// ============================================================

const failure = (
    res,
    error,
    fallback = "Something went wrong."
) => {

    console.error(
        "Onboarding Controller Error:",
        error
    );

    return res.status(
        getErrorStatus(error)
    ).json({

        success: false,

        message:
            error?.message ||
            fallback,

    });

};


// ============================================================
// REQUIRE SCHOOL ID
// ============================================================

const requireSchoolId = (req) => {

    const schoolId =
        getSchoolId(req);


    if (!schoolId) {

        const error =
            new Error(
                "School context missing."
            );

        error.statusCode = 400;

        throw error;

    }


    return schoolId;

};


// ============================================================
// GET ONBOARDING STATUS
// ============================================================

export const getOnboardingStatus = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const result =
            await getProgressStatus(
                schoolId
            );


        return res.status(200).json(
            result
        );


    } catch (error) {

        return failure(
            res,
            error,
            "Failed to get onboarding status."
        );

    }

};


// ============================================================
// GET DASHBOARD SUMMARY
// ============================================================

export const getDashboardSummary = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const summary =
            await getProgressSummary(
                schoolId
            );


        return res.status(200).json(
            summary
        );


    } catch (error) {

        return failure(
            res,
            error,
            "Failed to load onboarding summary."
        );

    }

};


// ============================================================
// REFRESH PROGRESS
// ============================================================

export const refreshProgress = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const onboarding =
            await refreshProgressService(
                schoolId
            );


        return success(

            res,

            "Onboarding progress refreshed successfully.",

            onboarding

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to refresh onboarding progress."

        );

    }

};


// ============================================================
// SAVE SCHOOL PROFILE
// ============================================================

export const saveSchoolProfile = async (
    req,
    res
) => {

    try {

        const schoolId =
            getSchoolId(req);


        let school;


        // ========================================================
        // FIRST ONBOARDING STEP
        // ========================================================
        //
        // If there is no school context yet, create the school.
        //
        // ========================================================

        if (!schoolId) {

            school =
                await createSchoolProfile(

                    req.body,

                    req.user?._id

                );

        } else {

            school =
                await setupSchoolProfile(

                    schoolId,

                    req.body

                );

        }


        return success(

            res,

            "School profile saved successfully.",

            school

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save school profile."

        );

    }

};


// ============================================================
// SAVE ACADEMIC SESSION
// ============================================================

export const saveAcademicSession = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const session =
            await setupAcademicSession(

                schoolId,

                {

                    ...req.body,

                    createdBy:
                        req.user?._id,

                }

            );


        return success(

            res,

            "Academic session created successfully.",

            session

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to create academic session."

        );

    }

};


// ============================================================
// SAVE TERMS
// ============================================================
//
// IMPORTANT:
//
// Term creation remains delegated to termService.setupTerms().
//
// The controller does NOT create Term documents directly.
//
// ============================================================

export const saveTerms = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const {
            sessionId,
            terms,
        } = req.body;


        if (!sessionId) {

            const error =
                new Error(
                    "Academic session is required."
                );

            error.statusCode = 400;

            throw error;

        }


        if (
            !Array.isArray(terms) ||
            terms.length === 0
        ) {

            const error =
                new Error(
                    "At least one academic term is required."
                );

            error.statusCode = 400;

            throw error;

        }


        const result =
            await setupTerms(

                schoolId,

                sessionId,

                terms

            );


        return success(

            res,

            "Academic terms saved successfully.",

            result

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save academic terms."

        );

    }

};


// ============================================================
// SAVE CLASSES
// ============================================================

export const saveClasses = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const classes =
            await setupClasses(

                schoolId,

                req.body.classes ||
                req.body

            );


        return success(

            res,

            "Classes saved successfully.",

            classes

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save classes."

        );

    }

};


// ============================================================
// SAVE CLASS ARMS
// ============================================================

export const saveClassArms = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const arms =
            await setupClassArms(

                schoolId,

                req.body.arms ||
                req.body

            );


        return success(

            res,

            "Class arms saved successfully.",

            arms

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save class arms."

        );

    }

};


// ============================================================
// SAVE SUBJECTS
// ============================================================

export const saveSubjects = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const subjects =
            await setupSubjects(

                schoolId,

                req.body.subjects ||
                req.body

            );


        return success(

            res,

            "Subjects saved successfully.",

            subjects

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save subjects."

        );

    }

};


// ============================================================
// SAVE DEPARTMENTS
// ============================================================

export const saveDepartments = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const departments =
            await setupDepartments(

                schoolId,

                req.body.departments ||
                req.body

            );


        return success(

            res,

            "Departments saved successfully.",

            departments

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save departments."

        );

    }

};


// ============================================================
// SAVE HOUSES
// ============================================================

export const saveHouses = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const houses =
            await setupHouses(

                schoolId,

                req.body.houses ||
                req.body

            );


        return success(

            res,

            "Houses saved successfully.",

            houses

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save houses."

        );

    }

};


// ============================================================
// SAVE FEE STRUCTURE
// ============================================================

export const saveFeeStructure = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const feeStructures =
            await setupFeeStructure(

                schoolId,

                req.body.fees ||
                req.body

            );


        return success(

            res,

            "Fee structure saved successfully.",

            feeStructures

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save fee structure."

        );

    }

};


// ============================================================
// SAVE GRADING SYSTEM
// ============================================================

export const saveGradingSystem = async (
    req,
    res
) => {

    try {

        const schoolId =
            requireSchoolId(req);


        const gradingSystem =
            await setupGradingSystem(

                schoolId,

                req.body

            );


        return success(

            res,

            "Grading system saved successfully.",

            gradingSystem

        );


    } catch (error) {

        return failure(

            res,

            error,

            "Failed to save grading system."

        );

    }

};


// ============================================================
// COMPLETE ONBOARDING
// ============================================================
//
// IMPORTANT:
//
// STEP_SEQUENCE is the authoritative list of required setup
// steps.
//
// ONBOARDING_STEPS.COMPLETED is intentionally NOT included
// because "completed" is a final state, not a setup step.
//
// ============================================================

export const completeOnboarding = async (req, res) => {
    try {
        const schoolId = requireSchoolId(req);
        const result = await finishOnboardingService(
            schoolId,
            req.user?._id
        );

        // keep the owner/admin user flags in step with the school
        await User.updateMany(
            { school: schoolId, role: "admin" },
            { $set: { onboardingCompleted: true } }
        );

        return res.status(200).json({
            ...result,
            message: "School onboarding completed successfully.",
        });
    } catch (error) {
        return failure(res, error, "Failed to complete onboarding.");
    }
};


// ============================================================
// RESET ONBOARDING
// ============================================================
//
// IMPORTANT:
//
// Resetting onboarding resets the onboarding progress state.
// It does NOT delete existing school configuration data.
//
// ============================================================

export const resetOnboarding = async (req, res) => {
    try {
        const schoolId = requireSchoolId(req);
        const result = await resetOnboardingService(schoolId);

        await User.updateMany(
            { school: schoolId, role: "admin" },
            { $set: { onboardingCompleted: false } }
        );

        return res.status(200).json({
            ...result,
            message: "Onboarding reset successfully.",
        });
    } catch (error) {
        return failure(res, error, "Failed to reset onboarding.");
    }
};

export const skipOnboardingStep = async (req, res) => {
    try {
        const result = await skipStepService(
            requireSchoolId(req),
            req.params.step
        );
        return res.status(200).json(result);
    } catch (error) {
        return failure(res, error, "Failed to skip step.");
    }
};

export const unskipOnboardingStep = async (req, res) => {
    try {
        const result = await unskipStepService(
            requireSchoolId(req),
            req.params.step
        );
        return res.status(200).json(result);
    } catch (error) {
        return failure(res, error, "Failed to restore step.");
    }
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {

    getOnboardingStatus,

    getDashboardSummary,

    refreshProgress,

    saveSchoolProfile,

    saveAcademicSession,

    saveTerms,

    saveClasses,

    saveClassArms,

    saveSubjects,

    saveDepartments,

    saveHouses,

    saveFeeStructure,

    saveGradingSystem,

    completeOnboarding,

    resetOnboarding,

};