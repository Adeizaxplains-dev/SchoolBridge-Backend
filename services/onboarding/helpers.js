// ============================================================
// backend/services/onboarding/helpers.js
// SchoolBridge Enterprise
// Onboarding Helper Utilities
//
// Contains NO database operations.
// ============================================================

import mongoose from "mongoose";

import {
    STEP_SEQUENCE,
    TOTAL_SETUP_STEPS,
    ONBOARDING_STEPS,
    REQUIRED_SETUP_STEPS,
} from "./constants.js";


// ============================================================
// OBJECT ID
// ============================================================

export const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id);


// ============================================================
// STRING HELPERS
// ============================================================

export const cleanString = (value = "") =>
    String(value).trim();


export const normalizeName = (value = "") =>
    cleanString(value).replace(/\s+/g, " ");


export const normalizeEmail = (email = "") =>
    cleanString(email).toLowerCase();


export const normalizePhone = (phone = "") =>
    cleanString(phone).replace(/\s+/g, "");


export const normalizeCode = (code = "") =>
    cleanString(code).toUpperCase();


export const normalizeWebsite = (website = "") =>
    cleanString(website);


export const normalizeAddress = (address = "") =>
    cleanString(address);


// ============================================================
// SLUG
// ============================================================

export const generateSlug = (name = "") =>

    normalizeName(name)

        .toLowerCase()

        .replace(/[^a-z0-9\s-]/g, "")

        .replace(/\s+/g, "-")

        .replace(/-+/g, "-")

        .replace(/^-|-$/g, "");


export const createSlug = generateSlug;


// ============================================================
// SCHOOL CODE
//
// Example:
//
// GREENFIELD SCHOOL
// -> GREE5274
// ============================================================

export const generateSchoolCode = (name = "") => {

    const letters =
        normalizeName(name)

            .replace(/[^A-Za-z]/g, "")

            .substring(0, 4)

            .toUpperCase()

            .padEnd(4, "X");


    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );


    return `${letters}${random}`;

};


// ============================================================
// VALIDATION
// ============================================================

export const validateRequiredFields = (
    data = {},
    fields = []
) => {

    const errors = {};


    fields.forEach((field) => {

        const value = data[field];


        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {

            errors[field] =
                `${field} is required`;

        }

    });


    return {

        valid:
            Object.keys(errors).length === 0,

        errors,

    };

};


export const ensureRequiredFields = (
    data,
    fields
) => {

    const validation =
        validateRequiredFields(
            data,
            fields
        );


    if (!validation.valid) {

        const error =
            new Error("Validation failed");


        error.status = 400;


        error.errors =
            validation.errors;


        throw error;

    }

};


// ============================================================
// NORMALIZE COMPLETED STEPS
//
// Ensures that:
// - only valid setup steps are retained
// - duplicate steps are removed
// - "completed" is never treated as a setup step
//
// This is important because completed is a final onboarding
// state, not one of the required setup steps.
// ============================================================

export const normalizeCompletedSteps = (
    completedSteps = []
) => {

    if (!Array.isArray(completedSteps)) {

        return [];

    }


    const unique =
        [...new Set(completedSteps)];


    return STEP_SEQUENCE.filter(
        (step) => unique.includes(step)
    );

};


// ============================================================
// PROGRESS
//
// Progress is calculated only from the required setup steps.
//
// Current sequence:
//
// 1. school_profile
// 2. academic_session
// 3. terms
// 4. classes
// 5. arms
// 6. subjects
// 7. departments
// 8. houses
// 9. fee_structure
// 10. grading_system
//
// "completed" is NOT counted as a setup step.
// ============================================================

export const calculateProgress = (
    completedSteps = []
) => {

    const normalized =
        normalizeCompletedSteps(
            completedSteps
        );


    const completed =
        normalized.length;


    if (TOTAL_SETUP_STEPS === 0) {

        return 100;

    }


    return Math.min(

        100,

        Math.round(

            (
                completed /
                TOTAL_SETUP_STEPS
            ) * 100

        )

    );

};


// ============================================================
// GET NEXT STEP
//
// Returns the first required setup step that has not yet
// been completed.
//
// If all required steps are complete, returns:
//
// ONBOARDING_STEPS.COMPLETED
// ============================================================

export const getNextStep = (
    completedSteps = []
) => {

    const normalized =
        normalizeCompletedSteps(
            completedSteps
        );


    const next =
        STEP_SEQUENCE.find(
            (step) =>
                !normalized.includes(step)
        );


    return (
        next ||
        ONBOARDING_STEPS.COMPLETED
    );

};


// ============================================================
// STEP COMPLETION CHECK
// ============================================================

export const hasCompletedStep = (
    completedSteps = [],
    step
) => {

    if (
        !Array.isArray(completedSteps)
    ) {

        return false;

    }


    return completedSteps.includes(step);

};


// ============================================================
// ADD COMPLETED STEP
//
// Only valid setup steps can be added.
// "completed" cannot be stored as a completed setup step.
// ============================================================

export const addCompletedStep = (
    completedSteps = [],
    step
) => {

    if (
        !STEP_SEQUENCE.includes(step)
    ) {

        throw new Error(
            `Invalid onboarding setup step: ${step}`
        );

    }


    return normalizeCompletedSteps([

        ...completedSteps,

        step,

    ]);

};


// ============================================================
// REMOVE COMPLETED STEP
// ============================================================

export const removeCompletedStep = (
    completedSteps = [],
    step
) => {

    return normalizeCompletedSteps(
        completedSteps
    ).filter(
        (item) => item !== step
    );

};


// ============================================================
// PREVIOUS STEP
// ============================================================

export const getPreviousStep = (
    currentStep
) => {

    const index =
        STEP_SEQUENCE.indexOf(
            currentStep
        );


    if (index <= 0) {

        return null;

    }


    return STEP_SEQUENCE[index - 1];

};


// ============================================================
// IS ONBOARDING COMPLETED
//
// Onboarding is completed only when every required setup
// step has been completed.
// ============================================================

export const isOnboardingCompleted = (
    completedSteps = []
) => {
    // Onboarding can be finished once every REQUIRED step is done.
    // Optional steps (arms, departments, houses, fees) never block it.
    const normalized = normalizeCompletedSteps(completedSteps);

    return REQUIRED_SETUP_STEPS.every((step) =>
        normalized.includes(step)
    );
};


// ============================================================
// COMPLETION SUMMARY
// ============================================================

export const getCompletionSummary = (
    completedSteps = []
) => {

    const normalized =
        normalizeCompletedSteps(
            completedSteps
        );


    const progress =
        calculateProgress(
            normalized
        );


    const completed =
        normalized.length;


    const remaining =
        Math.max(
            TOTAL_SETUP_STEPS - completed,
            0
        );


    return {

        totalSteps:
            TOTAL_SETUP_STEPS,

        completed,

        remaining,

        progress,

        nextStep:
            getNextStep(
                normalized
            ),

    };

};


// ============================================================
// ARRAY HELPERS
// ============================================================

export const toArray = (value) => {

    if (Array.isArray(value)) {

        return value;

    }


    if (
        value === null ||
        value === undefined
    ) {

        return [];

    }


    return [value];

};


// ============================================================
// UNIQUE BY
// ============================================================

export const uniqueBy = (
    array = [],
    key
) => {

    if (!Array.isArray(array)) {

        return [];

    }


    return [

        ...new Map(

            array.map(
                (item) => [
                    item?.[key],
                    item,
                ]
            )

        ).values(),

    ];

};


// ============================================================
// ERROR FORMATTER
// ============================================================

export const formatError = (error) => ({

    success: false,

    message:
        error?.message ||
        "Something went wrong",

    errors:
        error?.errors ||
        null,

});


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {

    // Object ID
    isValidObjectId,

    // Strings
    cleanString,
    normalizeName,
    normalizeEmail,
    normalizePhone,
    normalizeCode,
    normalizeWebsite,
    normalizeAddress,

    // Slug
    generateSlug,
    createSlug,

    // School
    generateSchoolCode,

    // Validation
    validateRequiredFields,
    ensureRequiredFields,

    // Onboarding steps
    normalizeCompletedSteps,

    // Progress
    calculateProgress,
    getNextStep,
    getPreviousStep,
    isOnboardingCompleted,

    // Step management
    hasCompletedStep,
    addCompletedStep,
    removeCompletedStep,

    // Summary
    getCompletionSummary,

    // Arrays
    toArray,
    uniqueBy,

    // Errors
    formatError,

};