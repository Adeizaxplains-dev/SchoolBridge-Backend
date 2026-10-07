// ============================================================
// backend/routes/onboardingRoutes.js
// SchoolBridge Enterprise
// Onboarding Routes
// ============================================================

import express from "express";

import {

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
    skipOnboardingStep,
    unskipOnboardingStep,

} from "../controllers/onboarding/onboardingController.js";



import {
    authMiddleware,
    adminOnly
} from "../middleware/authMiddleware.js";


import {
    schoolMiddleware
} from "../middleware/schoolMiddleware.js";



const router = express.Router();




// ============================================================
// GLOBAL SECURITY
// ============================================================

router.use(
    authMiddleware
);


router.use(
    schoolMiddleware
);


router.use(
    adminOnly
);




// ============================================================
// ONBOARDING STATUS
// ============================================================


router.get(
    "/status",
    getOnboardingStatus
);



router.get(
    "/summary",
    getDashboardSummary
);



router.post(
    "/refresh-progress",
    refreshProgress
);

// Skip / restore an OPTIONAL step (arms, departments, houses, fee_structure)
router.post("/skip/:step", skipOnboardingStep);
router.delete("/skip/:step", unskipOnboardingStep);




// ============================================================
// SCHOOL PROFILE
// ============================================================


router.post(
    "/school-profile",
    saveSchoolProfile
);




// ============================================================
// ACADEMIC SESSION
// ============================================================


router.post(
    "/academic-session",
    saveAcademicSession
);




// ============================================================
// TERMS
// ============================================================


router.post(
    "/terms",
    saveTerms
);




// ============================================================
// CLASSES
// ============================================================


router.post(
    "/classes",
    saveClasses
);




// ============================================================
// CLASS ARMS
// ============================================================


router.post(
    "/arms",
    saveClassArms
);




// ============================================================
// SUBJECTS
// ============================================================


router.post(
    "/subjects",
    saveSubjects
);




// ============================================================
// DEPARTMENTS
// ============================================================


router.post(
    "/departments",
    saveDepartments
);




// ============================================================
// HOUSES
// ============================================================


router.post(
    "/houses",
    saveHouses
);




// ============================================================
// FEES
// ============================================================


router.post(
    "/fee-structure",
    saveFeeStructure
);




// ============================================================
// GRADING
// ============================================================


router.post(
    "/grading-system",
    saveGradingSystem
);




// ============================================================
// COMPLETE
// ============================================================


router.post(
    "/complete",
    completeOnboarding
);




// ============================================================
// RESET
// ============================================================


router.delete(
    "/reset",
    resetOnboarding
);





export default router;