// ============================================================
// backend/controllers/onboarding/departmentController.js
// SchoolBridge Enterprise
// Department Controller
// ============================================================
//
// RESPONSIBILITIES
// ------------------------------------------------------------
// - Resolve authenticated school context
// - Validate request input
// - Delegate department business logic to departmentService
// - Return consistent API responses
//
// BUSINESS LOGIC
// ------------------------------------------------------------
// departmentService.js owns:
// - Department creation
// - Department updates
// - Department deletion
// - Department retrieval
// - Department validation
//
// onboardingController.js owns:
// - Onboarding workflow
// - Onboarding progress
// - Wizard step transitions
//
// ============================================================

import * as departmentService
    from "../../services/onboarding/departmentService.js";

import {
    isValidObjectId,
    formatError
} from "../../services/onboarding/helpers.js";


// ============================================================
// INTERNAL: GET SCHOOL ID
// ============================================================

const getSchoolId = (req) => {

    const schoolId =
        req.school?._id ||
        req.schoolId ||
        req.user?.school ||
        req.user?.schoolId;

    if (!schoolId) {

        const error =
            new Error(
                "School context is required."
            );

        error.status = 401;

        throw error;
    }

    if (!isValidObjectId(schoolId)) {

        const error =
            new Error(
                "Invalid school ID."
            );

        error.status = 400;

        throw error;
    }

    return schoolId;
};


// ============================================================
// INTERNAL: GET REQUEST BODY
// ============================================================

const getBody = (req) => {

    if (
        !req.body ||
        typeof req.body !== "object"
    ) {

        return {};
    }

    return req.body;
};


// ============================================================
// INTERNAL: ERROR HANDLER
// ============================================================

const handleControllerError = (
    res,
    error,
    next
) => {

    if (typeof next === "function") {

        return next(error);
    }

    return res
        .status(error?.status || 500)
        .json(
            formatError(error)
        );
};


// ============================================================
// GET ALL DEPARTMENTS
// ============================================================
//
// GET /school-setup/departments
//
// ============================================================

export const getDepartments = async (
    req,
    res,
    next
) => {

    try {

        const schoolId =
            getSchoolId(req);

        const departments =
            await departmentService.getDepartments(
                schoolId
            );

        return res.status(200).json({

            success: true,

            data: departments,

            departments

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            next
        );
    }
};


// ============================================================
// GET SINGLE DEPARTMENT
// ============================================================
//
// GET /school-setup/departments/:departmentId
//
// ============================================================

export const getDepartment = async (
    req,
    res,
    next
) => {

    try {

        const departmentId =
            req.params.departmentId ||
            req.params.id;

        if (
            !departmentId ||
            !isValidObjectId(departmentId)
        ) {

            const error =
                new Error(
                    "Invalid department ID."
                );

            error.status = 400;

            throw error;
        }

        const department =
            await departmentService.getDepartment(
                departmentId
            );

        return res.status(200).json({

            success: true,

            data: department,

            department

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            next
        );
    }
};


// ============================================================
// CREATE DEPARTMENT
// ============================================================
//
// POST /school-setup/departments
//
// ============================================================

export const createDepartment = async (
    req,
    res,
    next
) => {

    try {

        const schoolId =
            getSchoolId(req);

        const body =
            getBody(req);

        const department =
            body.department ||
            body;

        const created =
            await departmentService.createDepartments(
                schoolId,
                [department]
            );

        return res.status(201).json({

            success: true,

            message:
                "Department created successfully.",

            data:
                created?.[0] || null,

            department:
                created?.[0] || null

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            next
        );
    }
};


// ============================================================
// UPDATE DEPARTMENT
// ============================================================
//
// PUT /school-setup/departments/:departmentId
//
// ============================================================

export const updateDepartment = async (
    req,
    res,
    next
) => {

    try {

        const departmentId =
            req.params.departmentId ||
            req.params.id;

        if (
            !departmentId ||
            !isValidObjectId(departmentId)
        ) {

            const error =
                new Error(
                    "Invalid department ID."
                );

            error.status = 400;

            throw error;
        }

        const body =
            getBody(req);

        const departmentData =
            body.department ||
            body;

        const updated =
            await departmentService.updateDepartment(
                departmentId,
                departmentData
            );

        return res.status(200).json({

            success: true,

            message:
                "Department updated successfully.",

            data: updated,

            department: updated

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            next
        );
    }
};


// ============================================================
// DELETE DEPARTMENT
// ============================================================
//
// DELETE /school-setup/departments/:departmentId
//
// ============================================================

export const deleteDepartment = async (
    req,
    res,
    next
) => {

    try {

        const departmentId =
            req.params.departmentId ||
            req.params.id;

        if (
            !departmentId ||
            !isValidObjectId(departmentId)
        ) {

            const error =
                new Error(
                    "Invalid department ID."
                );

            error.status = 400;

            throw error;
        }

        const result =
            await departmentService.deleteDepartment(
                departmentId
            );

        return res.status(200).json({

            success: true,

            message:
                result?.message ||
                "Department deleted successfully."

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            next
        );
    }
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {

    getDepartments,

    getDepartment,

    createDepartment,

    updateDepartment,

    deleteDepartment

};