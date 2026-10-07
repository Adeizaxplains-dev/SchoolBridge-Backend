// ============================================================
// backend/routes/schoolSetupRoutes.js
// SchoolBridge Enterprise
// School Setup CRUD Routes
// ============================================================

import express from "express";

// ============================================================
// MIDDLEWARE
// ============================================================

import {
    authMiddleware,
    adminOnly,
} from "../middleware/authMiddleware.js";

import {
    schoolMiddleware,
} from "../middleware/schoolMiddleware.js";

// ============================================================
// CONTROLLERS
// ============================================================

import * as academicSessionController
    from "../controllers/onboarding/academicSessionController.js";

import * as termController
    from "../controllers/onboarding/termController.js";

import * as classController
    from "../controllers/onboarding/classController.js";

import * as armController
    from "../controllers/onboarding/classArmController.js";

import * as subjectController
    from "../controllers/onboarding/subjectController.js";

import * as departmentController
    from "../controllers/onboarding/departmentController.js";

import * as houseController
    from "../controllers/onboarding/houseController.js";


// ============================================================
// ROUTER
// ============================================================

const router = express.Router();

console.log("ACADEMIC SESSION CONTROLLER:", {
  getAcademicSessions: typeof academicSessionController.getAcademicSessions,
  getCurrentSession: typeof academicSessionController.getCurrentSession,
  getAcademicSession: typeof academicSessionController.getAcademicSession,
});

console.log("TERM CONTROLLER:", {
  getTerms: typeof termController.getTerms,
  getCurrentTerm: typeof termController.getCurrentTerm,
  getTerm: typeof termController.getTerm,
  createTerm: typeof termController.createTerm,
  updateTerm: typeof termController.updateTerm,
  deleteTerm: typeof termController.deleteTerm,
  setCurrentTerm: typeof termController.setCurrentTerm,
});

console.log("CLASS CONTROLLER:", {
  getClasses: typeof classController.getClasses,
  getClass: typeof classController.getClass,
  createClass: typeof classController.createClass,
  updateClass: typeof classController.updateClass,
  deleteClass: typeof classController.deleteClass,
});

console.log("ARM CONTROLLER:", {
  getClassArms: typeof armController.getClassArms,
  getClassArm: typeof armController.getClassArm,
  createClassArm: typeof armController.createClassArm,
  updateClassArm: typeof armController.updateClassArm,
  deleteClassArm: typeof armController.deleteClassArm,
});

console.log("SUBJECT CONTROLLER:", {
  getSubjects: typeof subjectController.getSubjects,
  getSubject: typeof subjectController.getSubject,
  createSubject: typeof subjectController.createSubject,
  updateSubject: typeof subjectController.updateSubject,
  deleteSubject: typeof subjectController.deleteSubject,
});

console.log("DEPARTMENT CONTROLLER:", {
  getDepartments: typeof departmentController.getDepartments,
  getDepartment: typeof departmentController.getDepartment,
  createDepartment: typeof departmentController.createDepartment,
  updateDepartment: typeof departmentController.updateDepartment,
  deleteDepartment: typeof departmentController.deleteDepartment,
});

console.log("HOUSE CONTROLLER:", {
  getHouses: typeof houseController.getHouses,
  getHouse: typeof houseController.getHouse,
  createHouse: typeof houseController.createHouse,
  updateHouse: typeof houseController.updateHouse,
  deleteHouse: typeof houseController.deleteHouse,
});

// ============================================================
// SECURITY
// ============================================================

router.use(authMiddleware);

router.use(schoolMiddleware);

router.use(adminOnly);

// ============================================================
// ACADEMIC SESSIONS
// ============================================================

// GET ALL
router.get(
    "/academic-sessions",
    academicSessionController.getAcademicSessions
);

// GET CURRENT
//
// IMPORTANT:
// Keep special/static routes BEFORE /:id
//
if (academicSessionController.getCurrentSession) {
    router.get(
        "/academic-sessions/current",
        academicSessionController.getCurrentSession
    );
}

// GET SINGLE
router.get(
    "/academic-sessions/:id",
    academicSessionController.getAcademicSession
);

// CREATE
router.post(
    "/academic-sessions",
    academicSessionController.createAcademicSession
);

// UPDATE
router.put(
    "/academic-sessions/:id",
    academicSessionController.updateAcademicSession
);

// DELETE
router.delete(
    "/academic-sessions/:id",
    academicSessionController.deleteAcademicSession
);

// ============================================================
// TERMS
// ============================================================

// GET CURRENT TERM
//
// IMPORTANT:
// MUST come before /terms/:id
//
router.get(
    "/terms/current",
    termController.getCurrentTerm
);

// ONBOARDING SETUP
router.post(
    "/terms/setup",
    termController.setupTerms
);

// GET ALL TERMS
router.get(
    "/terms",
    termController.getTerms
);

// GET SINGLE TERM
router.get(
    "/terms/:id",
    termController.getTerm
);


// CREATE TERM
router.post(
    "/terms",
    termController.createTerm
);

// UPDATE TERM
router.put(
    "/terms/:id",
    termController.updateTerm
);

// DELETE TERM
router.delete(
    "/terms/:id",
    termController.deleteTerm
);

// SET CURRENT TERM
router.post(
    "/terms/:id/current",
    termController.setCurrentTerm
);

// ============================================================
// CLASSES
// ============================================================

// GET ALL CLASSES
router.get(
    "/classes",
    classController.getClasses
);

// GET SINGLE CLASS
router.get(
    "/classes/:id",
    classController.getClass
);

// CREATE CLASS
router.post(
    "/classes",
    classController.createClass
);

// UPDATE CLASS
router.put(
    "/classes/:id",
    classController.updateClass
);

// DELETE CLASS
router.delete(
    "/classes/:id",
    classController.deleteClass
);

// ============================================================
// CLASS ARMS
// ============================================================

// GET ALL ARMS
router.get(
    "/arms",
    armController.getClassArms
);

// GET SINGLE ARM
router.get(
    "/arms/:id",
    armController.getClassArm
);

// CREATE ARM
router.post(
    "/arms",
    armController.createClassArm
);

// UPDATE ARM
router.put(
    "/arms/:id",
    armController.updateClassArm
);

// DELETE ARM
router.delete(
    "/arms/:id",
    armController.deleteClassArm
);

// ============================================================
// SUBJECTS
// ============================================================

// GET ALL SUBJECTS
router.get(
    "/subjects",
    subjectController.getSubjects
);

// GET SINGLE SUBJECT
router.get(
    "/subjects/:id",
    subjectController.getSubject
);

// CREATE SUBJECT
router.post(
    "/subjects",
    subjectController.createSubject
);

// UPDATE SUBJECT
router.put(
    "/subjects/:id",
    subjectController.updateSubject
);

// DELETE SUBJECT
router.delete(
    "/subjects/:id",
    subjectController.deleteSubject
);

// ============================================================
// DEPARTMENTS
// ============================================================

// GET ALL DEPARTMENTS
router.get(
    "/departments",
    departmentController.getDepartments
);

// GET SINGLE DEPARTMENT
router.get(
    "/departments/:id",
    departmentController.getDepartment
);

// CREATE DEPARTMENT
router.post(
    "/departments",
    departmentController.createDepartment
);

// UPDATE DEPARTMENT
router.put(
    "/departments/:id",
    departmentController.updateDepartment
);

// DELETE DEPARTMENT
router.delete(
    "/departments/:id",
    departmentController.deleteDepartment
);

// ============================================================
// HOUSES
// ============================================================

// GET ALL HOUSES
router.get(
    "/houses",
    houseController.getHouses
);

// GET SINGLE HOUSE
router.get(
    "/houses/:id",
    houseController.getHouse
);

// CREATE HOUSE
router.post(
    "/houses",
    houseController.createHouse
);

// UPDATE HOUSE
router.put(
    "/houses/:id",
    houseController.updateHouse
);

// DELETE HOUSE
router.delete(
    "/houses/:id",
    houseController.deleteHouse
);

// ============================================================
// EXPORT
// ============================================================

export default router;