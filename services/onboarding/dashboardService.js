// ============================================================
// backend/services/onboarding/dashboardService.js
// SchoolBridge Enterprise Onboarding Dashboard Service
// ============================================================

import School from "../../models/School.js";
import Onboarding from "../../models/Onboarding.js";

import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";

import Class from "../../models/Class.js";
import Subject from "../../models/Subject.js";

import FeeStructure from "../../models/FeeStructure.js";
import GradingSystem from "../../models/GradingSystem.js";
import AcademicSession from "../../models/AcademicSession.js";

import {
    getNextStep,
} from "./helpers.js";



// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getSchool = async (schoolId) => {

    const school = await School.findById(schoolId).lean();

    if (!school) {
        throw new Error("School not found");
    }

    return school;
};

const getOnboardingRecord = async (schoolId) => {

    return await Onboarding.findOne({
        school: schoolId,
    }).lean();

};



// ============================================================
// GET ONBOARDING STATUS
// Used by Sidebar / Dashboard
// ============================================================

export const getOnboardingStatus = async (schoolId) => {

    const school = await getSchool(schoolId);

    const onboarding =
        await getOnboardingRecord(schoolId);

    if (!onboarding) {

        return {

            status: "not_started",

            progress: 0,

            currentStep: "school_profile",

            completedSteps: [],

            nextAction: "school_profile",

            school: {

                id: school._id,

                name: school.name,

                code: school.code,

                logo: school.logo || "",

                onboardingCompleted:
                    school.onboardingCompleted || false,

                onboardingPercentage:
                    school.onboardingPercentage || 0,

            },

        };

    }

    const completedSteps =
        onboarding.completedSteps || [];

    return {

        status:
            onboarding.status || "in_progress",

        progress:
            onboarding.progress || 0,

        currentStep:
            onboarding.currentStep ||
            "school_profile",

        completedSteps,

        nextAction:
            getNextStep(completedSteps),

        school: {

            id: school._id,

            name: school.name,

            code: school.code,

            logo: school.logo || "",

            onboardingCompleted:
                school.onboardingCompleted || false,

            onboardingPercentage:
                school.onboardingPercentage ||
                onboarding.progress ||
                0,

        },

    };

};

// ============================================================
// GET DASHBOARD SUMMARY
// Used by Onboard.jsx
// ============================================================

export const getDashboardSummary = async (schoolId) => {

    const school = await getSchool(schoolId);

    const onboarding =
        await Onboarding.findOne({
            school: schoolId,
        }).lean();

    const [

        students,
        teachers,
        classes,
        subjects,
        fees,
        gradingSystems,
        academicSessions,

    ] = await Promise.all([

        Student.countDocuments({
            school: schoolId,
        }),

        Teacher.countDocuments({
            school: schoolId,
        }),

        Class.countDocuments({
            school: schoolId,
        }),

        Subject.countDocuments({
            school: schoolId,
        }),

        FeeStructure.countDocuments({
            school: schoolId,
        }),

        GradingSystem.countDocuments({
            school: schoolId,
        }),

        AcademicSession.countDocuments({
            school: schoolId,
        }),

    ]);

    const completedSteps =
        onboarding?.completedSteps || [];

    return {

        school: {

            id: school._id,

            name: school.name,

            code: school.code,

            logo: school.logo || "",

            subscriptionPlan:
                school.subscriptionPlan,

            subscriptionStatus:
                school.subscriptionStatus,

        },

        setup: {

            status:
                onboarding?.status ||
                "not_started",

            progress:
                onboarding?.progress ?? 0,

            currentStep:
                onboarding?.currentStep ||
                "school_profile",

            completedSteps,

            nextStep:
                getNextStep(
                    completedSteps
                ),

        },

        statistics: {

            students,

            teachers,

            classes,

            subjects,

            feeStructures: fees,

            gradingSystems,

            academicSessions,

        },

    };

};



// ============================================================
// CHECK SCHOOL READINESS
// ============================================================

export const checkSchoolReadiness = async (schoolId) => {

    await getSchool(schoolId);

    const [

        session,

        classes,

        subjects,

        grading,

    ] = await Promise.all([

        AcademicSession.exists({
            school: schoolId,
        }),

        Class.countDocuments({
            school: schoolId,
        }),

        Subject.countDocuments({
            school: schoolId,
        }),

        GradingSystem.exists({
            school: schoolId,
        }),

    ]);

    const missing = [];

    if (!session) {

        missing.push(
            "Academic Session"
        );

    }

    if (classes === 0) {

        missing.push(
            "Classes"
        );

    }

    if (subjects === 0) {

        missing.push(
            "Subjects"
        );

    }

    if (!grading) {

        missing.push(
            "Grading System"
        );

    }

    return {

        ready:
            missing.length === 0,

        missing,

    };

};

// ============================================================
// REFRESH DASHBOARD SUMMARY
// Compatibility wrapper
// ============================================================

export const refreshDashboardSummary = async (
    schoolId
) => {

    return await getDashboardSummary(
        schoolId
    );

};



// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {

    // Status

    getOnboardingStatus,

    // Dashboard

    getDashboardSummary,

    refreshDashboardSummary,

    // Validation

    checkSchoolReadiness,

};