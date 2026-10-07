// ============================================================
// backend/services/onboarding/constants.js
// SchoolBridge Enterprise
// Onboarding Constants
//
// Single source of truth for:
// - onboarding status
// - onboarding steps
// - execution order
// - dashboard labels
// - default school settings
// - subscriptions
// - feature flags
// - limits
// ============================================================


// ============================================================
// ONBOARDING STATUS
// ============================================================

export const ONBOARDING_STATUS = Object.freeze({

    NOT_STARTED: "not_started",

    IN_PROGRESS: "in_progress",

    COMPLETED: "completed",

    RESET: "reset",

});


// ============================================================
// ONBOARDING STEPS
// ============================================================
//
// IMPORTANT:
// COMPLETED is a final navigation/state value.
// It is NOT a setup step and therefore must never appear
// inside STEP_SEQUENCE.
// ============================================================

export const ONBOARDING_STEPS = Object.freeze({

    SCHOOL_PROFILE: "school_profile",

    ACADEMIC_SESSION: "academic_session",

    TERMS: "terms",

    CLASSES: "classes",

    ARMS: "arms",

    SUBJECTS: "subjects",

    DEPARTMENTS: "departments",

    HOUSES: "houses",

    FEE_STRUCTURE: "fee_structure",

    GRADING_SYSTEM: "grading_system",

    COMPLETED: "completed",

});


// ============================================================
// STEP EXECUTION ORDER
// ============================================================
//
// This is the authoritative onboarding workflow.
//
// DO NOT add COMPLETED here.
// COMPLETED represents the state after all required setup
// steps have been completed.
// ============================================================

export const STEP_SEQUENCE = Object.freeze([

    ONBOARDING_STEPS.SCHOOL_PROFILE,

    ONBOARDING_STEPS.ACADEMIC_SESSION,

    ONBOARDING_STEPS.TERMS,

    ONBOARDING_STEPS.CLASSES,

    ONBOARDING_STEPS.ARMS,

    ONBOARDING_STEPS.SUBJECTS,

    ONBOARDING_STEPS.DEPARTMENTS,

    ONBOARDING_STEPS.HOUSES,

    ONBOARDING_STEPS.FEE_STRUCTURE,

    ONBOARDING_STEPS.GRADING_SYSTEM,

]);


// ============================================================
// STEP INDEX
// ============================================================
//
// Provides O(1) lookup for the position of a setup step.
//
// Example:
// STEP_INDEX["school_profile"] === 0
// STEP_INDEX["terms"] === 2
// ============================================================

export const STEP_INDEX = Object.freeze(

    STEP_SEQUENCE.reduce(

        (accumulator, step, index) => {

            accumulator[step] = index;

            return accumulator;

        },

        {}

    )

);


// ============================================================
// STEP VALIDATION
// ============================================================

export const isRequiredSetupStep = (step) => {

    return STEP_SEQUENCE.includes(step);

};


// ============================================================
// TOTAL REQUIRED SETUP STEPS
// ============================================================

export const TOTAL_SETUP_STEPS =
    STEP_SEQUENCE.length;


// ============================================================
// STEP LABELS
// ============================================================

export const STEP_LABELS = Object.freeze({

    [ONBOARDING_STEPS.SCHOOL_PROFILE]:
        "School Profile",

    [ONBOARDING_STEPS.ACADEMIC_SESSION]:
        "Academic Session",

    [ONBOARDING_STEPS.TERMS]:
        "Academic Terms",

    [ONBOARDING_STEPS.CLASSES]:
        "Classes",

    [ONBOARDING_STEPS.ARMS]:
        "Class Arms",

    [ONBOARDING_STEPS.SUBJECTS]:
        "Subjects",

    [ONBOARDING_STEPS.DEPARTMENTS]:
        "Departments",

    [ONBOARDING_STEPS.HOUSES]:
        "School Houses",

    [ONBOARDING_STEPS.FEE_STRUCTURE]:
        "Fee Structure",

    [ONBOARDING_STEPS.GRADING_SYSTEM]:
        "Grading System",

    [ONBOARDING_STEPS.COMPLETED]:
        "Completed",

});


// ============================================================
// DEFAULT SCHOOL SETTINGS
// ============================================================

// Where each step is configured in the frontend and the key the
// setup overview UI uses for it.
export const STEP_META = Object.freeze({
    [ONBOARDING_STEPS.SCHOOL_PROFILE]: { key: "profile", route: "/admin/school-setup/profile", description: "School name, contact and address." },
    [ONBOARDING_STEPS.ACADEMIC_SESSION]: { key: "sessions", route: "/admin/school-setup/academic-sessions", description: "Create the current academic session." },
    [ONBOARDING_STEPS.TERMS]: { key: "terms", route: "/admin/school-setup/terms", description: "Define the terms in the session." },
    [ONBOARDING_STEPS.CLASSES]: { key: "classes", route: "/admin/school-setup/classes", description: "Add the classes in your school." },
    [ONBOARDING_STEPS.ARMS]: { key: "arms", route: "/admin/school-setup/arms", description: "Class arms such as A, B, Gold." },
    [ONBOARDING_STEPS.SUBJECTS]: { key: "subjects", route: "/admin/school-setup/subjects", description: "Subjects taught in your school." },
    [ONBOARDING_STEPS.DEPARTMENTS]: { key: "departments", route: "/admin/school-setup/departments", description: "Academic departments." },
    [ONBOARDING_STEPS.HOUSES]: { key: "houses", route: "/admin/school-setup/houses", description: "Sports / school houses." },
    [ONBOARDING_STEPS.FEE_STRUCTURE]: { key: "fees", route: "/admin/school-setup/fee-structure", description: "School fees per class and term." },
    [ONBOARDING_STEPS.GRADING_SYSTEM]: { key: "grading", route: "/admin/school-setup/grading-system", description: "Grade boundaries and remarks." },
});

export const DEFAULT_SCHOOL_SETTINGS = Object.freeze({

    currency: "NGN",

    timezone: "Africa/Lagos",

    academicYearStart: 9,

    gradingType: "percentage",

});


// ============================================================
// DEFAULT SUBSCRIPTION
// ============================================================

export const DEFAULT_SUBSCRIPTION = Object.freeze({

    plan: "trial",

    status: "trial",

    trialDays: 14,

});


// ============================================================
// DEFAULT FEATURES
// ============================================================

export const DEFAULT_FEATURES = Object.freeze({

    attendance: true,

    resultManagement: true,

    assignments: true,

    messaging: true,

    finance: true,

    library: false,

    hostel: false,

    transport: false,

});


// ============================================================
// DEFAULT LIMITS
// ============================================================

export const DEFAULT_LIMITS = Object.freeze({

    students: 100,

    teachers: 20,

    parents: 100,

    branches: 1,

});


// ============================================================
// REQUIRED SETUP STEPS
// ============================================================
//
// Alias maintained for services that explicitly refer to
// REQUIRED_SETUP_STEPS.
//
// A new array is created so consumers cannot accidentally
// mutate STEP_SEQUENCE through this alias.
// ============================================================

// Steps a school may SKIP during onboarding and configure later.
// Everything else in STEP_SEQUENCE must be completed with real data.
export const OPTIONAL_SETUP_STEPS = Object.freeze([
    ONBOARDING_STEPS.ARMS,
    ONBOARDING_STEPS.DEPARTMENTS,
    ONBOARDING_STEPS.HOUSES,
    ONBOARDING_STEPS.FEE_STRUCTURE,
]);

export const REQUIRED_SETUP_STEPS = Object.freeze(
    STEP_SEQUENCE.filter(
        (step) => !OPTIONAL_SETUP_STEPS.includes(step)
    )
);


// ============================================================
// OPTIONAL SETUP STEPS
// ============================================================
//
// Currently all onboarding steps are required.
// Keep this available so optional setup modules can be added
// later without changing the progress-service API.
// ============================================================



// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {

    ONBOARDING_STATUS,

    ONBOARDING_STEPS,

    STEP_SEQUENCE,

    STEP_INDEX,

    TOTAL_SETUP_STEPS,

    STEP_LABELS,

    DEFAULT_SCHOOL_SETTINGS,

    DEFAULT_SUBSCRIPTION,

    DEFAULT_FEATURES,

    DEFAULT_LIMITS,

    REQUIRED_SETUP_STEPS,

    OPTIONAL_SETUP_STEPS,

    isRequiredSetupStep,

};