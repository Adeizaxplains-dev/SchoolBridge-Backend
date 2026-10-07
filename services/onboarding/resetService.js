// ============================================================
// backend/services/onboarding/resetService.js
// SchoolBridge Enterprise Onboarding Reset Service
// ============================================================

import mongoose from "mongoose";

// ============================================================
// MODELS
// ============================================================

import School from "../../models/School.js";
import Onboarding from "../../models/Onboarding.js";

import AcademicSession from "../../models/AcademicSession.js";
import Term from "../../models/Term.js";
import Class from "../../models/Class.js";
import ClassArm from "../../models/ClassArm.js";
import Subject from "../../models/Subject.js";
import Department from "../../models/Department.js";
import House from "../../models/House.js";
import FeeStructure from "../../models/FeeStructure.js";
import GradingSystem from "../../models/GradingSystem.js";



// ============================================================
// RESET SERVICE
// ============================================================

class ResetService {

    // ========================================================
    // HELPERS
    // ========================================================

    async getSchool(schoolId, session = null) {

        const query = School.findById(schoolId);

        if (session) {
            query.session(session);
        }

        const school = await query;

        if (!school) {
            throw new Error("School not found");
        }

        return school;

    }



    // ========================================================
    // FULL RESET
    // Deletes onboarding configuration only
    // ========================================================

    async resetSchoolSetup(schoolId) {

        const session = await mongoose.startSession();

        session.startTransaction();

        try {

            const school = await this.getSchool(
                schoolId,
                session
            );



            // -----------------------------------------------
            // DELETE ACADEMIC CONFIGURATION
            // -----------------------------------------------

            await AcademicSession.deleteMany(
                { school: school._id },
                { session }
            );

            await Term.deleteMany(
                { school: school._id },
                { session }
            );

            await Class.deleteMany(
                { school: school._id },
                { session }
            );

            await ClassArm.deleteMany(
                { school: school._id },
                { session }
            );

            await Subject.deleteMany(
                { school: school._id },
                { session }
            );

            await Department.deleteMany(
                { school: school._id },
                { session }
            );

            await House.deleteMany(
                { school: school._id },
                { session }
            );



            // -----------------------------------------------
            // DELETE FINANCIAL CONFIGURATION
            // -----------------------------------------------

            await FeeStructure.deleteMany(
                { school: school._id },
                { session }
            );



            // -----------------------------------------------
            // DELETE GRADING SYSTEM
            // -----------------------------------------------

            await GradingSystem.deleteMany(
                { school: school._id },
                { session }
            );



            // -----------------------------------------------
            // RESET ONBOARDING DOCUMENT
            // -----------------------------------------------

            await Onboarding.findOneAndUpdate(

                {
                    school: school._id,
                },

                {
                    status: "not_started",

                    progress: 0,

                    currentStep: "school_profile",

                    completedSteps: [],

                    academicSession: null,

                    terms: [],

                    classes: [],

                    arms: [],

                    subjects: [],

                    departments: [],

                    houses: [],

                    feeStructures: [],

                    gradingSystem: null,

                    completedAt: null,

                    completedBy: null,

                    lastVisitedStep: "school_profile",

                },

                {
                    session,
                    new: true,
                }

            );



            // -----------------------------------------------
            // RESET SCHOOL FLAGS
            // -----------------------------------------------

            await School.findByIdAndUpdate(

                school._id,

                {

                    currentAcademicSession: null,

                    currentTerm: null,

                    onboardingCompleted: false,

                    onboardingPercentage: 0,

                    currentSetupStep: "school_profile",

                    setupProgress: 0,

                    setupCompleted: false,

                    setupCompletedAt: null,

                    lastSetupStep: "schoolProfile",

                },

                {
                    session,
                }

            );

                        // -----------------------------------------------
            // COMMIT TRANSACTION
            // -----------------------------------------------

            await session.commitTransaction();

            session.endSession();

            return {

                success: true,

                message:
                    "School onboarding reset successfully",

            };

        } catch (error) {

            await session.abortTransaction();

            session.endSession();

            throw error;

        }

    }



    // ========================================================
    // RESET PROGRESS ONLY
    // Does NOT delete any configuration
    // ========================================================

    async resetProgressOnly(schoolId) {

        await this.getSchool(schoolId);

        const onboarding =
            await Onboarding.findOneAndUpdate(

                {
                    school: schoolId,
                },

                {

                    status: "in_progress",

                    progress: 0,

                    currentStep: "school_profile",

                    completedSteps: [],

                    completedAt: null,

                    completedBy: null,

                    lastVisitedStep: "school_profile",

                },

                {

                    new: true,

                }

            );



        await School.findByIdAndUpdate(

            schoolId,

            {

                onboardingCompleted: false,

                onboardingPercentage: 0,

                currentSetupStep: "school_profile",

                setupProgress: 0,

                setupCompleted: false,

                setupCompletedAt: null,

                lastSetupStep: "schoolProfile",

            }

        );



        return onboarding;

    }



    // ========================================================
    // CHECK WHETHER RESET IS ALLOWED
    // ========================================================

    async canReset(schoolId) {

        const school =
            await this.getSchool(schoolId);

        return {

            allowed:
                !school.onboardingCompleted,

            completed:
                school.onboardingCompleted,

            message:

                school.onboardingCompleted

                    ? "Completed schools require administrator approval before reset."

                    : "Reset allowed",

        };

    }

        // ========================================================
    // FORCE RESET
    // Allows administrators to completely restart onboarding
    // even after completion.
    // ========================================================

    async forceReset(schoolId) {

        return await this.resetSchoolSetup(schoolId);

    }

}



// ============================================================
// EXPORT
// ============================================================

export default new ResetService();