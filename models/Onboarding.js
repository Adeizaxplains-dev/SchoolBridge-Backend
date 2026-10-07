// ============================================================
// backend/models/Onboarding.js
// SchoolBridge Enterprise
// Onboarding Model
// ============================================================

import mongoose from "mongoose";

import {
    ONBOARDING_STEPS,
    ONBOARDING_STATUS,
    STEP_SEQUENCE,
} from "../services/onboarding/constants.js";

import {
    calculateProgress,
    getNextStep,
    isOnboardingCompleted,
} from "../services/onboarding/helpers.js";

const { Schema } = mongoose;


// ============================================================
// CONSTANT VALUES
// ============================================================
//
// STEP_SEQUENCE contains ONLY real onboarding setup steps.
//
// ONBOARDING_STEPS.COMPLETED is deliberately excluded because
// it represents a final navigation/state value, not a setup
// task that can be stored in completedSteps.
//

const COMPLETABLE_STEPS =
    Object.freeze(
        [...STEP_SEQUENCE]
    );


const STEP_VALUES =
    Object.values(
        ONBOARDING_STEPS
    );


const STATUS_VALUES =
    Object.values(
        ONBOARDING_STATUS
    );


// ============================================================
// SCHEMA
// ============================================================

const onboardingSchema = new Schema(

    {

        // ====================================================
        // SCHOOL
        // ====================================================

        school: {

            type:
                Schema.Types.ObjectId,

            ref:
                "School",

            required:
                true,

            unique:
                true,

            index:
                true,

        },


        // ====================================================
        // CREATED RESOURCES
        // ====================================================

        academicSession: {

            type:
                Schema.Types.ObjectId,

            ref:
                "AcademicSession",

            default:
                null,

        },


        terms: [

            {

                type:
                    Schema.Types.ObjectId,

                ref:
                    "Term",

            },

        ],


        classes: [

            {

                type:
                    Schema.Types.ObjectId,

                ref:
                    "Class",

            },

        ],


        arms: [

            {

                type:
                    Schema.Types.ObjectId,

                ref:
                    "ClassArm",

            },

        ],


        subjects: [

            {

                type:
                    Schema.Types.ObjectId,

                ref:
                    "Subject",

            },

        ],


        departments: [

            {

                type:
                    Schema.Types.ObjectId,

                ref:
                    "Department",

            },

        ],


        houses: [

            {

                type:
                    Schema.Types.ObjectId,

                ref:
                    "House",

            },

        ],


        feeStructures: [

            {

                type:
                    Schema.Types.ObjectId,

                ref:
                    "FeeStructure",

            },

        ],


        gradingSystem: {

            type:
                Schema.Types.ObjectId,

            ref:
                "GradingSystem",

            default:
                null,

        },


        // ====================================================
        // NAVIGATION STATE
        // ====================================================

        status: {

            type:
                String,

            enum:
                STATUS_VALUES,

            default:
                ONBOARDING_STATUS.NOT_STARTED,

            index:
                true,

        },


        currentStep: {

            type:
                String,

            enum:
                STEP_VALUES,

            default:
                ONBOARDING_STEPS.SCHOOL_PROFILE,

            index:
                true,

        },


        // ====================================================
        // COMPLETED STEPS
        // ====================================================
        //
        // Only real setup steps are allowed here.
        //
        // "completed" must NEVER be stored in this array.
        //

        completedSteps: [

            {

                type:
                    String,

                enum:
                    COMPLETABLE_STEPS,

            },

        ],


        // ====================================================
        // SKIPPED (OPTIONAL) STEPS
        // ====================================================
        //
        // Only steps listed in OPTIONAL_SETUP_STEPS may appear here.
        //
        skippedSteps: [
            {
                type:
                    String,
                enum:
                    COMPLETABLE_STEPS,
            },
        ],
        // ====================================================
        // PROGRESS
        // ====================================================

        progress: {

            type:
                Number,

            default:
                0,

            min:
                0,

            max:
                100,

        },


        // ====================================================
        // COMPLETION INFORMATION
        // ====================================================

        completedAt: {

            type:
                Date,

            default:
                null,

        },


        completedBy: {

            type:
                Schema.Types.ObjectId,

            ref:
                "User",

            default:
                null,

        },


        // ====================================================
        // LAST VISITED STEP
        // ====================================================

        lastVisitedStep: {

            type:
                String,

            enum:
                STEP_VALUES,

            default:
                ONBOARDING_STEPS.SCHOOL_PROFILE,

        },


        // ====================================================
        // NOTES
        // ====================================================

        notes: {

            type:
                String,

            default:
                "",

            trim:
                true,

        },

    },

    {

        timestamps:
            true,

        versionKey:
            false,

    }

);


// ============================================================
// INDEXES
// ============================================================

onboardingSchema.index({

    school:
        1,

    status:
        1,

});


onboardingSchema.index({

    school:
        1,

    currentStep:
        1,

});


onboardingSchema.index({

    progress:
        -1,

});


// ============================================================
// VIRTUAL: IS COMPLETED
// ============================================================

onboardingSchema.virtual(
    "isCompleted"
).get(function () {

    return (
        this.status ===
        ONBOARDING_STATUS.COMPLETED
    );

});


// ============================================================
// VIRTUAL: REMAINING STEPS
// ============================================================

onboardingSchema.virtual(
    "remainingSteps"
).get(function () {

    const completed =
        Array.isArray(
            this.completedSteps
        )
            ? this.completedSteps
            : [];


    return COMPLETABLE_STEPS.filter(

        (step) =>
            !completed.includes(
                step
            )

    );

});


// ============================================================
// INSTANCE METHOD: MARK COMPLETED
// ============================================================

onboardingSchema.methods.markCompleted =
    function (userId = null) {

        this.status =
            ONBOARDING_STATUS.COMPLETED;


        this.currentStep =
            ONBOARDING_STEPS.COMPLETED;


        this.progress =
            100;


        this.completedAt =
            this.completedAt ||
            new Date();


        if (userId) {

            this.completedBy =
                userId;

        }


        this.lastVisitedStep =
            ONBOARDING_STEPS.COMPLETED;


        return this;

    };


// ============================================================
// INSTANCE METHOD: RESET PROGRESS
// ============================================================

onboardingSchema.methods.resetProgress =
    function () {

        this.status =
            ONBOARDING_STATUS.NOT_STARTED;


        this.currentStep =
            ONBOARDING_STEPS.SCHOOL_PROFILE;


        this.completedSteps =
            [];


        this.progress =
            0;


        this.completedAt =
            null;


        this.completedBy =
            null;


        this.lastVisitedStep =
            ONBOARDING_STEPS.SCHOOL_PROFILE;


        return this;

    };


// ============================================================
// INSTANCE METHOD: COMPLETE STEP
// ============================================================

onboardingSchema.methods.completeStep =
    function (
        step,
        userId = null
    ) {

        // ====================================================
        // VALIDATE STEP
        // ====================================================

        if (
            !COMPLETABLE_STEPS.includes(
                step
            )
        ) {

            throw new Error(
                `Invalid onboarding step: ${step}`
            );

        }


        // ====================================================
        // ENSURE ARRAY
        // ====================================================

        if (
            !Array.isArray(
                this.completedSteps
            )
        ) {

            this.completedSteps =
                [];

        }


        // ====================================================
        // ADD STEP
        // ====================================================

        if (
            !this.completedSteps.includes(
                step
            )
        ) {

            this.completedSteps.push(
                step
            );

        }


        // ====================================================
        // REMOVE DUPLICATES
        // ====================================================

        this.completedSteps = [
            ...new Set(
                this.completedSteps
            ),
        ];


        // ====================================================
        // CALCULATE PROGRESS
        // ====================================================

        this.progress =
            calculateProgress(
                this.completedSteps
            );


        // ====================================================
        // DETERMINE NEXT STEP
        // ====================================================

        this.currentStep =
            getNextStep(
                this.completedSteps
            );


        // ====================================================
        // LAST VISITED STEP
        // ====================================================

        this.lastVisitedStep =
            step;


        // ====================================================
        // DETERMINE STATUS
        // ====================================================

        if (
            isOnboardingCompleted(
                this.completedSteps
            )
        ) {

            this.markCompleted(
                userId
            );

        } else {

            this.status =
                ONBOARDING_STATUS.IN_PROGRESS;


            this.completedAt =
                null;


            this.completedBy =
                null;

        }


        return this;

    };


// ============================================================
// INSTANCE METHOD: REMOVE COMPLETED STEP
// ============================================================

onboardingSchema.methods.removeStep =
    function (step) {

        // ====================================================
        // VALIDATE STEP
        // ====================================================

        if (
            !COMPLETABLE_STEPS.includes(
                step
            )
        ) {

            throw new Error(
                `Invalid onboarding step: ${step}`
            );

        }


        // ====================================================
        // ENSURE ARRAY
        // ====================================================

        if (
            !Array.isArray(
                this.completedSteps
            )
        ) {

            this.completedSteps =
                [];

        }


        // ====================================================
        // REMOVE STEP
        // ====================================================

        this.completedSteps =
            this.completedSteps.filter(

                (item) =>
                    item !== step

            );


        // ====================================================
        // RECALCULATE PROGRESS
        // ====================================================

        this.progress =
            calculateProgress(
                this.completedSteps
            );


        // ====================================================
        // DETERMINE NEXT STEP
        // ====================================================

        this.currentStep =
            getNextStep(
                this.completedSteps
            );


        // ====================================================
        // ONBOARDING IS NO LONGER COMPLETE
        // ====================================================

        this.status =
            ONBOARDING_STATUS.IN_PROGRESS;


        this.completedAt =
            null;


        this.completedBy =
            null;


        // ====================================================
        // LAST VISITED STEP
        // ====================================================

        this.lastVisitedStep =
            this.currentStep;


        return this;

    };


// ============================================================
// STATIC: GET OR CREATE
// ============================================================
//
// Supports:
//
// Onboarding.getOrCreate(schoolId)
//
// Onboarding.getOrCreate(
//     schoolId,
//     mongoSession
// )
//
// This is important because onboarding operations can occur
// inside MongoDB transactions.
//

onboardingSchema.statics.getOrCreate =
    async function (

        schoolId,

        session = null

    ) {

        if (!schoolId) {

            throw new Error(
                "School ID is required."
            );

        }


        // ====================================================
        // FIND EXISTING ONBOARDING
        // ====================================================

        const query =
            this.findOne({

                school:
                    schoolId,

            });


        if (session) {

            query.session(
                session
            );

        }


        const onboarding =
            await query;


        // ====================================================
        // RETURN EXISTING
        // ====================================================

        if (onboarding) {

            return onboarding;

        }


        // ====================================================
        // CREATE NEW
        // ====================================================

        const onboardingData = {

            school:
                schoolId,

            status:
                ONBOARDING_STATUS.IN_PROGRESS,

            currentStep:
                ONBOARDING_STEPS.SCHOOL_PROFILE,

            completedSteps:
                [],

            progress:
                0,

            lastVisitedStep:
                ONBOARDING_STEPS.SCHOOL_PROFILE,

        };


        // ====================================================
        // TRANSACTION CREATE
        // ====================================================

        if (session) {

            const [
                created
            ] = await this.create(

                [onboardingData],

                {
                    session,
                }

            );


            return created;

        }


        // ====================================================
        // NORMAL CREATE
        // ====================================================

        return this.create(
            onboardingData
        );

    };


// ============================================================
// PRE-SAVE VALIDATION
// ============================================================
//
// This hook is intentionally limited to maintaining safe
// persisted state.
//
// Progress calculation remains owned by completeStep/removeStep
// and progressService.
// ============================================================

onboardingSchema.pre(
    "save",
    async function () {

        // ====================================================
        // ENSURE ARRAY
        // ====================================================

        if (
            !Array.isArray(
                this.completedSteps
            )
        ) {

            this.completedSteps =
                [];

        }


        // ====================================================
        // REMOVE DUPLICATES
        // ====================================================

        this.completedSteps = [
            ...new Set(
                this.completedSteps
            ),
        ];


        // ====================================================
        // KEEP PROGRESS VALID
        // ====================================================

        if (
            typeof this.progress !== "number" ||
            Number.isNaN(
                this.progress
            )
        ) {

            this.progress =
                0;

        }


        if (
            this.progress < 0
        ) {

            this.progress =
                0;

        }


        if (
            this.progress > 100
        ) {

            this.progress =
                100;

        }


        // ====================================================
        // ENSURE LAST VISITED STEP
        // ====================================================

        if (
            !STEP_VALUES.includes(
                this.lastVisitedStep
            )
        ) {

            this.lastVisitedStep =
                this.currentStep ||
                ONBOARDING_STEPS.SCHOOL_PROFILE;

        }


        // ====================================================
        // ENSURE CURRENT STEP
        // ====================================================

        if (
            !STEP_VALUES.includes(
                this.currentStep
            )
        ) {

            this.currentStep =
                ONBOARDING_STEPS.SCHOOL_PROFILE;

        }


        // ====================================================
        // COMPLETED STATE
        // ====================================================

        if (
            this.status ===
            ONBOARDING_STATUS.COMPLETED
        ) {

            this.progress =
                100;


            this.currentStep =
                ONBOARDING_STEPS.COMPLETED;


            this.lastVisitedStep =
                ONBOARDING_STEPS.COMPLETED;


            if (
                !this.completedAt
            ) {

                this.completedAt =
                    new Date();

            }

        }

        // ====================================================
        // INCOMPLETE STATE
        // ====================================================

        else {

            this.completedAt =
                null;

            this.completedBy =
                null;

        }

    }
);


// ============================================================
// JSON CONFIGURATION
// ============================================================

onboardingSchema.set(
    "toJSON",
    {
        virtuals: true,
    }
);


onboardingSchema.set(
    "toObject",
    {
        virtuals: true,
    }
);


// ============================================================
// MODEL
// ============================================================

const Onboarding =
    mongoose.models.Onboarding ||
    mongoose.model(
        "Onboarding",
        onboardingSchema
    );


// ============================================================
// EXPORT
// ============================================================

export default Onboarding;