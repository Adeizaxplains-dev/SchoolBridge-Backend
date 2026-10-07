// ============================================================
// backend/services/onboarding/index.js
// SchoolBridge Enterprise
// Onboarding Service Aggregator
// ============================================================
//
// SINGLE ENTRY POINT
//
// Controllers should ONLY import this file.
//
// import onboardingService from
// "../../services/onboarding/index.js";
//
// ============================================================

// ============================================================
// IMPORT SERVICES
// ============================================================

import schoolProfileService from "./schoolProfileService.js";
import academicSessionService from "./academicSessionService.js";
import termService from "./termService.js";
import classService from "./classService.js";
import classArmService from "./classArmService.js";
import subjectService from "./subjectService.js";
import departmentService from "./departmentService.js";
import houseService from "./houseService.js";
import feeStructureService from "./feeStructureService.js";
import gradingSystemService from "./gradingSystemService.js";

import progressService from "./progressService.js";
import dashboardService from "./dashboardService.js";
import completionService from "./completionService.js";
import resetService from "./resetService.js";

// ============================================================
// AGGREGATOR
// ============================================================

const onboardingService = {
  // ==========================================================
  // EXPORT EVERYTHING
  // ==========================================================

  ...schoolProfileService,
  ...academicSessionService,
  ...termService,
  ...classService,
  ...classArmService,
  ...subjectService,
  ...departmentService,
  ...houseService,
  ...feeStructureService,
  ...gradingSystemService,
  ...progressService,
  ...dashboardService,
  ...completionService,
  ...resetService,

  // ==========================================================
  // SCHOOL PROFILE
  // ==========================================================

  setupSchoolProfile:
    schoolProfileService.setupSchoolProfile,

  // ==========================================================
  // STATUS
  // ==========================================================

  getOnboardingStatus:
    schoolProfileService.getOnboardingStatus,

  getDashboardSummary:
    progressService.getProgressSummary,

  refreshProgress:
    progressService.refreshProgress,

  // ==========================================================
  // ACADEMIC SESSION
  // ==========================================================

  setupAcademicSession:
    academicSessionService.setupAcademicSession,

  // ==========================================================
  // TERMS
  // ==========================================================

  setupTerms:
    termService.setupTerms,

  // Backward compatibility
  createTerms:
    termService.createTerms,

  // ==========================================================
  // CLASSES
  // ==========================================================

  setupClasses:
    classService.setupClasses,

  createClasses:
    classService.createClasses,

  // ==========================================================
  // CLASS ARMS
  // ==========================================================

  setupClassArms:
    classArmService.setupClassArms,

  createClassArms:
    classArmService.createClassArms,

  // ==========================================================
  // SUBJECTS
  // ==========================================================

  setupSubjects:
    subjectService.setupSubjects,

  createSubjects:
    subjectService.createSubjects,

  // ==========================================================
  // DEPARTMENTS
  // ==========================================================

  setupDepartments:
    departmentService.setupDepartments,

  createDepartments:
    departmentService.createDepartments,

  // ==========================================================
  // HOUSES
  // ==========================================================

  setupHouses:
    houseService.setupHouses,

  createHouses:
    houseService.createHouses,

  // ==========================================================
  // FEE STRUCTURE
  // ==========================================================

  createFeeStructure:
    feeStructureService.createFeeStructures,

  createFeeStructures:
    feeStructureService.createFeeStructures,

  // ==========================================================
  // GRADING SYSTEM
  // ==========================================================

  async createGradingSystem(
    school,
    data
  ) {
    return gradingSystemService.createGradingSystem(
      school,
      data
    );
  },

  // ==========================================================
  // PROGRESS
  // ==========================================================

  getProgressSummary:
    progressService.getProgressSummary,

  markStepCompleted:
    progressService.markStepCompleted,

  markStepIncomplete:
    progressService.markStepIncomplete,

  updateSchoolCompletion:
    progressService.updateSchoolCompletion,

  // ==========================================================
  // COMPLETE
  // ==========================================================

  async completeOnboarding(
    school
  ) {
    return completionService.completeOnboarding(
      school
    );
  },

  // ==========================================================
  // RESET
  // ==========================================================

  async resetOnboarding(
    school
  ) {
    return resetService.resetSchoolSetup(
      school
    );
  },
};

// ============================================================
// EXPORT
// ============================================================

export default onboardingService;