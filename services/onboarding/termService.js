// ============================================================
// backend/services/onboarding/termService.js
// SchoolBridge Enterprise
// Academic Term Service
//
// RESPONSIBILITIES
// ------------------------------------------------------------
// - Create onboarding terms
// - Update onboarding terms safely
// - Retrieve terms
// - Retrieve current term
// - Set current term
// - Soft-delete terms
// - Keep Term model fields consistent
// - Keep School.currentTerm synchronized
// - Complete/incomplete onboarding "terms" step
//
// IMPORTANT
// ------------------------------------------------------------
// Term.js is the source of truth for the Term document shape.
//
// Canonical fields:
//   academicSession
//   termNumber
//   position
//   isCurrent
//   isDeleted
//   status
//
// Do NOT use:
//   session
//   order
//   isActive
// ============================================================

import mongoose from "mongoose";

import Term from "../../models/Term.js";
import School from "../../models/School.js";
import AcademicSession from "../../models/AcademicSession.js";

import { ONBOARDING_STEPS } from "./constants.js";

import {
    markStepCompleted,
    markStepIncomplete,
} from "./progressService.js";

import {
    isValidObjectId,
    cleanString,
} from "./helpers.js";

// ============================================================
// CONSTANTS
// ============================================================

const TERM_STATUSES = [
    "Active",
    "Inactive",
    "Archived",
];

const MIN_TERM_NUMBER = 1;
const MAX_TERM_NUMBER = 3;

// ============================================================
// NORMALIZE NAME
// ============================================================

const normalizeName = (value = "") => {
    return cleanString(value)
        .replace(/\s+/g, " ");
};

// ============================================================
// NORMALIZE CODE
// ============================================================

const normalizeCode = (value = "") => {
    return cleanString(value)
        .replace(/\s+/g, "")
        .toUpperCase();
};

// ============================================================
// VALIDATE TERM NUMBER
// ============================================================

const normalizeTermNumber = (value) => {
    const number = Number(value);

    if (
        !Number.isInteger(number) ||
        number < MIN_TERM_NUMBER ||
        number > MAX_TERM_NUMBER
    ) {
        throw new Error(
            "Term number must be an integer between 1 and 3."
        );
    }

    return number;
};

// ============================================================
// VALIDATE STATUS
// ============================================================

const normalizeStatus = (value = "Active") => {
    const status = cleanString(value) || "Active";

    if (!TERM_STATUSES.includes(status)) {
        throw new Error(
            `Invalid term status. Allowed values: ${TERM_STATUSES.join(
                ", "
            )}.`
        );
    }

    return status;
};

// ============================================================
// VALIDATE DATE RANGE
// ============================================================

const normalizeDate = (value, fieldName) => {
    if (!value) {
        throw new Error(
            `${fieldName} is required.`
        );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(
            `${fieldName} is invalid.`
        );
    }

    return date;
};

const validateDateRange = (
    startDate,
    endDate
) => {
    const start = normalizeDate(
        startDate,
        "Start date"
    );

    const end = normalizeDate(
        endDate,
        "End date"
    );

    if (end <= start) {
        throw new Error(
            "End date must be after start date."
        );
    }

    return {
        startDate: start,
        endDate: end,
    };
};

// ============================================================
// VALIDATE SCHOOL
// ============================================================

const getSchool = async (
    schoolId,
    mongoSession = null
) => {
    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    const query = School.findById(
        schoolId
    );

    if (mongoSession) {
        query.session(mongoSession);
    }

    const school = await query;

    if (!school) {
        throw new Error(
            "School not found."
        );
    }

    return school;
};

// ============================================================
// VALIDATE ACADEMIC SESSION
// ============================================================

const getAcademicSession = async (
    schoolId,
    sessionId,
    mongoSession = null
) => {
    if (!isValidObjectId(sessionId)) {
        throw new Error(
            "Invalid academic session ID."
        );
    }

    const query =
        AcademicSession.findOne({
            _id: sessionId,
            school: schoolId,
            isDeleted: false,
        });

    if (mongoSession) {
        query.session(mongoSession);
    }

    const academicSession =
        await query;

    if (!academicSession) {
        throw new Error(
            "Academic session not found."
        );
    }

    return academicSession;
};

// ============================================================
// NORMALIZE TERM INPUT
// ============================================================
//
// Accepts both:
//   termNumber
// and legacy:
//   position
//
// They are synchronized before persistence.
//
// ============================================================

const normalizeTermInput = (
    term,
    index = 0
) => {
    if (!term || typeof term !== "object") {
        throw new Error(
            `Term ${index + 1} is invalid.`
        );
    }

    const name = normalizeName(
        term.name
    );

    if (!name) {
        throw new Error(
            `Term ${index + 1} name is required.`
        );
    }

    const code = normalizeCode(
        term.code
    );

    if (!code) {
        throw new Error(
            `Term ${index + 1} code is required.`
        );
    }

    const suppliedTermNumber =
        term.termNumber !== undefined &&
        term.termNumber !== null
            ? term.termNumber
            : term.position;

    const termNumber =
        suppliedTermNumber !== undefined &&
        suppliedTermNumber !== null
            ? normalizeTermNumber(
                  suppliedTermNumber
              )
            : normalizeTermNumber(
                  index + 1
              );

    const {
        startDate,
        endDate,
    } = validateDateRange(
        term.startDate,
        term.endDate
    );

    const status =
        normalizeStatus(
            term.status
        );

    const description =
        term.description === undefined
            ? ""
            : String(
                  term.description
              ).trim();

    return {
        name,
        code,
        termNumber,
        position: termNumber,
        startDate,
        endDate,
        status,
        description,
        isCurrent:
            term.isCurrent === true,
    };
};

// ============================================================
// VALIDATE TERM COLLECTION
// ============================================================

const validateTerms = (
    terms = []
) => {
    if (
        !Array.isArray(terms) ||
        terms.length === 0
    ) {
        throw new Error(
            "At least one term is required."
        );
    }

    if (terms.length > 3) {
        throw new Error(
            "An academic session can have a maximum of three terms."
        );
    }

    const normalizedTerms =
        terms.map(
            (term, index) =>
                normalizeTermInput(
                    term,
                    index
                )
        );

    // --------------------------------------------------------
    // TERM NUMBERS MUST BE UNIQUE
    // --------------------------------------------------------

    const termNumbers =
        normalizedTerms.map(
            (term) =>
                term.termNumber
        );

    if (
        new Set(termNumbers).size !==
        termNumbers.length
    ) {
        throw new Error(
            "Duplicate term numbers are not allowed."
        );
    }

    // --------------------------------------------------------
    // NAMES MUST BE UNIQUE
    // --------------------------------------------------------

    const names =
        normalizedTerms.map(
            (term) =>
                term.name.toLowerCase()
        );

    if (
        new Set(names).size !==
        names.length
    ) {
        throw new Error(
            "Duplicate term names are not allowed."
        );
    }

    // --------------------------------------------------------
    // CODES MUST BE UNIQUE
    // --------------------------------------------------------

    const codes =
        normalizedTerms.map(
            (term) =>
                term.code.toUpperCase()
        );

    if (
        new Set(codes).size !==
        codes.length
    ) {
        throw new Error(
            "Duplicate term codes are not allowed."
        );
    }

    // --------------------------------------------------------
    // ONLY ONE CURRENT TERM
    // --------------------------------------------------------

    const currentTerms =
        normalizedTerms.filter(
            (term) =>
                term.isCurrent
        );

    if (currentTerms.length > 1) {
        throw new Error(
            "Only one term can be current."
        );
    }

    return normalizedTerms;
};

// ============================================================
// BUILD TERM DOCUMENT
// ============================================================

const buildTermDocument = ({
    schoolId,
    sessionId,
    term,
    userId,
}) => {
    return {
        school: schoolId,

        academicSession:
            sessionId,

        name: term.name,

        code: term.code,

        termNumber:
            term.termNumber,

        position:
            term.position,

        startDate:
            term.startDate,

        endDate:
            term.endDate,

        status:
            term.status,

        description:
            term.description,

        isCurrent:
            term.isCurrent,

        isDeleted: false,

        createdBy:
            userId || undefined,

        updatedBy:
            userId || undefined,
    };
};

// ============================================================
// CLEAR CURRENT TERM
// ============================================================

const clearCurrentTerms = async (
    schoolId,
    mongoSession,
    exceptTermId = null
) => {
    const filter = {
        school: schoolId,
        isCurrent: true,
        isDeleted: false,
    };

    if (exceptTermId) {
        filter._id = {
            $ne: exceptTermId,
        };
    }

    await Term.updateMany(
        filter,
        {
            $set: {
                isCurrent: false,
            },
        },
        {
            session: mongoSession,
        }
    );
};

// ============================================================
// SYNC SCHOOL CURRENT TERM
// ============================================================

const syncSchoolCurrentTerm = async (
    schoolId,
    termId,
    mongoSession
) => {
    if (termId) {
        await School.findByIdAndUpdate(
            schoolId,
            {
                $set: {
                    currentTerm: termId,
                },
            },
            {
                session: mongoSession,
                returnDocument: "after",
            }
        );

        return;
    }

    await School.findOneAndUpdate(
        {
            _id: schoolId,
        },
        {
            $unset: {
                currentTerm: 1,
            },
        },
        {
            session: mongoSession,
            returnDocument: "after",
        }
    );
};

// ============================================================
// FIND CURRENT TERM
// ============================================================

const findCurrentTerm = async (
    schoolId,
    mongoSession = null
) => {
    const query = Term.findOne({
        school: schoolId,
        isCurrent: true,
        isDeleted: false,
    });

    if (mongoSession) {
        query.session(mongoSession);
    }

    return await query;
};

// ============================================================
// CREATE TERMS
// ============================================================
//
// Used by onboarding.
//
// This function creates the complete term collection for
// one academic session.
//
// ============================================================

export const createTerms = async (
    schoolId,
    sessionId,
    terms,
    options = {}
) => {
    const {
        userId = null,
        mongoSession = null,
    } = options;

    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    if (!isValidObjectId(sessionId)) {
        throw new Error(
            "Invalid academic session ID."
        );
    }

    const normalizedTerms =
        validateTerms(terms);

    await getSchool(
        schoolId,
        mongoSession
    );

    await getAcademicSession(
        schoolId,
        sessionId,
        mongoSession
    );

    // --------------------------------------------------------
    // PREVENT DUPLICATE CONFIGURATION
    // --------------------------------------------------------

    const existingQuery =
        Term.findOne({
            school: schoolId,
            academicSession: sessionId,
            isDeleted: false,
        });

    if (mongoSession) {
        existingQuery.session(
            mongoSession
        );
    }

    const existing =
        await existingQuery;

    if (existing) {
        throw new Error(
            "Terms are already configured for this academic session."
        );
    }

    // --------------------------------------------------------
    // CURRENT TERM
    // --------------------------------------------------------

    const explicitlyCurrent =
        normalizedTerms.find(
            (term) =>
                term.isCurrent
        );

    // If the frontend did not specify a current term,
    // use the first term.
    const currentTermNumber =
        explicitlyCurrent
            ? explicitlyCurrent.termNumber
            : normalizedTerms[0]
                  .termNumber;

    const documents =
        normalizedTerms.map(
            (term) => ({
                ...buildTermDocument({
                    schoolId,
                    sessionId,
                    term: {
                        ...term,
                        isCurrent:
                            term.termNumber ===
                            currentTermNumber,
                    },
                    userId,
                }),
            })
        );

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const createdTerms =
        await Term.create(
            documents,
            mongoSession
                ? {
                      session:
                          mongoSession,
                  }
                : undefined
        );

    const currentTerm =
        createdTerms.find(
            (term) =>
                term.isCurrent
        );

    // --------------------------------------------------------
    // SYNC SCHOOL
    // --------------------------------------------------------

    if (currentTerm) {
        await syncSchoolCurrentTerm(
            schoolId,
            currentTerm._id,
            mongoSession
        );
    }

    // --------------------------------------------------------
    // ONBOARDING
    // --------------------------------------------------------

    const onboarding =
        await markStepCompleted(
            schoolId,
            ONBOARDING_STEPS.TERMS,
            mongoSession
        );

    return {
        terms: createdTerms,
        onboarding,
    };
};

// ============================================================
// UPDATE TERMS
// ============================================================
//
// IMPORTANT:
// This does NOT delete/recreate existing term records.
//
// Existing term IDs are preserved.
//
// This is safer because other modules may reference Term._id.
//
// ============================================================

export const updateTerms = async (
    schoolId,
    sessionId,
    terms,
    options = {}
) => {
    const {
        userId = null,
        mongoSession = null,
    } = options;

    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    if (!isValidObjectId(sessionId)) {
        throw new Error(
            "Invalid academic session ID."
        );
    }

    const normalizedTerms =
        validateTerms(terms);

    await getSchool(
        schoolId,
        mongoSession
    );

    await getAcademicSession(
        schoolId,
        sessionId,
        mongoSession
    );

    const query =
        Term.find({
            school: schoolId,
            academicSession: sessionId,
            isDeleted: false,
        }).sort({
            termNumber: 1,
        });

    if (mongoSession) {
        query.session(
            mongoSession
        );
    }

    const existingTerms =
        await query;

    // --------------------------------------------------------
    // REMOVE CURRENT FLAG FIRST
    // --------------------------------------------------------

    await clearCurrentTerms(
        schoolId,
        mongoSession
    );

    const updatedTerms = [];

    // --------------------------------------------------------
    // UPDATE EXISTING / CREATE MISSING
    // --------------------------------------------------------

    for (
        let index = 0;
        index < normalizedTerms.length;
        index++
    ) {
        const incoming =
            normalizedTerms[index];

        const existing =
            existingTerms.find(
                (term) =>
                    term.termNumber ===
                    incoming.termNumber
            );

        if (existing) {
            existing.name =
                incoming.name;

            existing.code =
                incoming.code;

            existing.position =
                incoming.position;

            existing.termNumber =
                incoming.termNumber;

            existing.startDate =
                incoming.startDate;

            existing.endDate =
                incoming.endDate;

            existing.status =
                incoming.status;

            existing.description =
                incoming.description;

            existing.isCurrent =
                incoming.termNumber ===
                normalizedTerms.find(
                    (item) =>
                        item.isCurrent
                )?.termNumber;

            existing.updatedBy =
                userId || undefined;

            await existing.save(
                mongoSession
                    ? {
                          session:
                              mongoSession,
                      }
                    : undefined
            );

            updatedTerms.push(
                existing
            );
        } else {
            const newTerm =
                new Term(
                    buildTermDocument({
                        schoolId,
                        sessionId,
                        term: {
                            ...incoming,
                            isCurrent:
                                false,
                        },
                        userId,
                    })
                );

            await newTerm.save(
                mongoSession
                    ? {
                          session:
                              mongoSession,
                      }
                    : undefined
            );

            updatedTerms.push(
                newTerm
            );
        }
    }

    // --------------------------------------------------------
    // SOFT DELETE TERMS REMOVED FROM THE FORM
    // --------------------------------------------------------

    const incomingNumbers =
        new Set(
            normalizedTerms.map(
                (term) =>
                    term.termNumber
            )
        );

    for (
        const existing of existingTerms
    ) {
        if (
            !incomingNumbers.has(
                existing.termNumber
            )
        ) {
            existing.isDeleted =
                true;

            existing.status =
                "Archived";

            existing.isCurrent =
                false;

            existing.updatedBy =
                userId || undefined;

            await existing.save(
                mongoSession
                    ? {
                          session:
                              mongoSession,
                      }
                    : undefined
            );
        }
    }

    // --------------------------------------------------------
    // DETERMINE CURRENT TERM
    // --------------------------------------------------------

    const requestedCurrent =
        normalizedTerms.find(
            (term) =>
                term.isCurrent
        );

    const currentTerm =
        updatedTerms.find(
            (term) =>
                term.termNumber ===
                (
                    requestedCurrent
                        ? requestedCurrent.termNumber
                        : normalizedTerms[0]
                              .termNumber
                )
        );

    if (!currentTerm) {
        throw new Error(
            "Unable to determine the current term."
        );
    }

    // --------------------------------------------------------
    // ENSURE ONLY ONE CURRENT TERM
    // --------------------------------------------------------

    await clearCurrentTerms(
        schoolId,
        mongoSession,
        currentTerm._id
    );

    currentTerm.isCurrent =
        true;

    currentTerm.updatedBy =
        userId || undefined;

    await currentTerm.save(
        mongoSession
            ? {
                  session:
                      mongoSession,
              }
            : undefined
    );

    // --------------------------------------------------------
    // SYNC SCHOOL
    // --------------------------------------------------------

    await syncSchoolCurrentTerm(
        schoolId,
        currentTerm._id,
        mongoSession
    );

    // --------------------------------------------------------
    // ONBOARDING
    // --------------------------------------------------------

    const onboarding =
        await markStepCompleted(
            schoolId,
            ONBOARDING_STEPS.TERMS,
            mongoSession
        );

    return {
        terms: updatedTerms,
        onboarding,
    };
};

// ============================================================
// GET ALL TERMS
// ============================================================

export const getTerms = async (
    schoolId,
    sessionId = null
) => {
    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    const filter = {
        school: schoolId,
        isDeleted: false,
    };

    if (sessionId) {
        if (
            !isValidObjectId(sessionId)
        ) {
            throw new Error(
                "Invalid academic session ID."
            );
        }

        filter.academicSession =
            sessionId;
    }

    return await Term.find(filter)
        .populate({
            path:
                "academicSession",
            select:
                "name startDate endDate status isCurrent",
        })
        .sort({
            termNumber: 1,
            createdAt: 1,
        })
        .lean();
};

// ============================================================
// GET SINGLE TERM
// ============================================================

export const getTerm = async (
    schoolId,
    termId
) => {
    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    if (!isValidObjectId(termId)) {
        throw new Error(
            "Invalid term ID."
        );
    }

    const term =
        await Term.findOne({
            _id: termId,
            school: schoolId,
            isDeleted: false,
        }).populate({
            path:
                "academicSession",
            select:
                "name startDate endDate status isCurrent",
        });

    if (!term) {
        throw new Error(
            "Term not found."
        );
    }

    return term;
};

// ============================================================
// GET CURRENT TERM
// ============================================================

export const getCurrentTerm = async (
    schoolId
) => {
    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    const term =
        await findCurrentTerm(
            schoolId
        );

    if (!term) {
        throw new Error(
            "Current term not found."
        );
    }

    return term;
};

// ============================================================
// SET CURRENT TERM
// ============================================================

export const setCurrentTerm = async (
    schoolId,
    termId,
    options = {}
) => {
    const {
        userId = null,
        mongoSession = null,
    } = options;

    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    if (!isValidObjectId(termId)) {
        throw new Error(
            "Invalid term ID."
        );
    }

    const query =
        Term.findOne({
            _id: termId,
            school: schoolId,
            isDeleted: false,
        });

    if (mongoSession) {
        query.session(
            mongoSession
        );
    }

    const term = await query;

    if (!term) {
        throw new Error(
            "Term not found."
        );
    }

    // --------------------------------------------------------
    // CLEAR OTHER CURRENT TERMS
    // --------------------------------------------------------

    await clearCurrentTerms(
        schoolId,
        mongoSession,
        term._id
    );

    // --------------------------------------------------------
    // SET SELECTED TERM
    // --------------------------------------------------------

    term.isCurrent =
        true;

    term.updatedBy =
        userId || undefined;

    await term.save(
        mongoSession
            ? {
                  session:
                      mongoSession,
              }
            : undefined
    );

    // --------------------------------------------------------
    // SYNC SCHOOL
    // --------------------------------------------------------

    await syncSchoolCurrentTerm(
        schoolId,
        term._id,
        mongoSession
    );

    return term;
};

// ============================================================
// DELETE TERM
// ============================================================
//
// Soft delete only.
//
// ============================================================

export const deleteTerm = async (
    schoolId,
    termId,
    options = {}
) => {
    const {
        userId = null,
        mongoSession = null,
    } = options;

    if (!isValidObjectId(schoolId)) {
        throw new Error(
            "Invalid school ID."
        );
    }

    if (!isValidObjectId(termId)) {
        throw new Error(
            "Invalid term ID."
        );
    }

    const query =
        Term.findOne({
            _id: termId,
            school: schoolId,
            isDeleted: false,
        });

    if (mongoSession) {
        query.session(
            mongoSession
        );
    }

    const term = await query;

    if (!term) {
        throw new Error(
            "Term not found."
        );
    }

    if (term.isCurrent) {
        throw new Error(
            "Cannot delete the current term. Please select another current term first."
        );
    }

    term.isDeleted =
        true;

    term.status =
        "Archived";

    term.updatedBy =
        userId || undefined;

    await term.save(
        mongoSession
            ? {
                  session:
                      mongoSession,
              }
            : undefined
    );

    // --------------------------------------------------------
    // CHECK REMAINING TERMS
    // --------------------------------------------------------

    const remainingQuery =
        Term.countDocuments({
            school: schoolId,
            academicSession:
                term.academicSession,
            isDeleted: false,
        });

    if (mongoSession) {
        remainingQuery.session(
            mongoSession
        );
    }

    const remainingTerms =
        await remainingQuery;

    let onboarding = null;

    if (remainingTerms === 0) {
        onboarding =
            await markStepIncomplete(
                schoolId,
                ONBOARDING_STEPS.TERMS,
                mongoSession
            );
    }

    return {
        term,
        onboarding,
    };
};

// ============================================================
// ONBOARDING COMPATIBILITY WRAPPER
// ============================================================
//
// Existing onboarding controller code can continue calling:
//
// setupTerms(schoolId, sessionId, terms)
//
// This preserves the existing API contract.
//
// ============================================================

export const setupTerms = async (
    schoolId,
    sessionId,
    terms,
    options = {}
) => {
    return await createTerms(
        schoolId,
        sessionId,
        terms,
        options
    );
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
    setupTerms,

    createTerms,

    updateTerms,

    getTerms,

    getTerm,

    getCurrentTerm,

    setCurrentTerm,

    deleteTerm,
};