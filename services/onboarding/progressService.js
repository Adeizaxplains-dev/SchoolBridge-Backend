// ============================================================
// backend/services/onboarding/progressService.js
// SchoolBridge - Onboarding progress engine
//
// SINGLE SOURCE OF TRUTH: the school's real data.
//
// A step is "completed" when the data it configures exists
// (e.g. `classes` is complete when the school has >= 1 class).
// This means it does not matter whether data was created by the
// wizard, a CRUD page or a batch endpoint - progress can never
// drift from reality.
//
//  - OPTIONAL steps can be skipped (Onboarding.skippedSteps)
//  - Onboarding is finished explicitly (POST /onboarding/complete)
//    once every REQUIRED step is complete. Completion is sticky.
//  - `School` fields are kept in sync as a cache for auth/login.
// ============================================================

import Onboarding from "../../models/Onboarding.js";
import School from "../../models/School.js";
import AcademicSession from "../../models/AcademicSession.js";
import Term from "../../models/Term.js";
import Class from "../../models/Class.js";
import ClassArm from "../../models/ClassArm.js";
import Subject from "../../models/Subject.js";
import Department from "../../models/Department.js";
import House from "../../models/House.js";
import FeeStructure from "../../models/FeeStructure.js";
import GradingSystem from "../../models/GradingSystem.js";

import {
    ONBOARDING_STATUS,
    ONBOARDING_STEPS,
    STEP_SEQUENCE,
    OPTIONAL_SETUP_STEPS,
    REQUIRED_SETUP_STEPS,
    STEP_META,
} from "./constants.js";

// step -> Model whose documents prove the step is done
const DATA_MODELS = {
    [ONBOARDING_STEPS.ACADEMIC_SESSION]: AcademicSession,
    [ONBOARDING_STEPS.TERMS]: Term,
    [ONBOARDING_STEPS.CLASSES]: Class,
    [ONBOARDING_STEPS.ARMS]: ClassArm,
    [ONBOARDING_STEPS.SUBJECTS]: Subject,
    [ONBOARDING_STEPS.DEPARTMENTS]: Department,
    [ONBOARDING_STEPS.HOUSES]: House,
    [ONBOARDING_STEPS.FEE_STRUCTURE]: FeeStructure,
    [ONBOARDING_STEPS.GRADING_SYSTEM]: GradingSystem,
};

// step -> School.setup.<flag> (legacy cache still read by old code)
const LEGACY_FLAGS = {
    [ONBOARDING_STEPS.SCHOOL_PROFILE]: "schoolProfile",
    [ONBOARDING_STEPS.ACADEMIC_SESSION]: "academicSession",
    [ONBOARDING_STEPS.TERMS]: "terms",
    [ONBOARDING_STEPS.CLASSES]: "classes",
    [ONBOARDING_STEPS.ARMS]: "arms",
    [ONBOARDING_STEPS.SUBJECTS]: "subjects",
    [ONBOARDING_STEPS.DEPARTMENTS]: "departments",
    [ONBOARDING_STEPS.HOUSES]: "houses",
    [ONBOARDING_STEPS.FEE_STRUCTURE]: "feeStructure",
    [ONBOARDING_STEPS.GRADING_SYSTEM]: "gradingSystem",
};

const validateSchoolId = (schoolId) => {
    if (!schoolId) throw new Error("School ID is required.");
};

const validateStep = (step) => {
    if (!STEP_SEQUENCE.includes(step)) {
        throw new Error(`Invalid onboarding step: ${step}`);
    }
};

const inSession = (query, session) =>
    session ? query.session(session) : query;

// ------------------------------------------------------------
// GET OR CREATE
// ------------------------------------------------------------

export const getOrCreateOnboarding = async (schoolId, session = null) => {
    validateSchoolId(schoolId);

    const existing = await inSession(
        Onboarding.findOne({ school: schoolId }),
        session
    );

    if (existing) return existing;

    // Schools finished under the old system stay finished.
    const school = await inSession(
        School.findById(schoolId).select("onboardingCompleted setupCompleted"),
        session
    );
    const legacyDone = Boolean(
        school?.onboardingCompleted || school?.setupCompleted
    );

    const data = {
        school: schoolId,
        status: legacyDone
            ? ONBOARDING_STATUS.COMPLETED
            : ONBOARDING_STATUS.IN_PROGRESS,
        currentStep: legacyDone
            ? ONBOARDING_STEPS.COMPLETED
            : ONBOARDING_STEPS.SCHOOL_PROFILE,
        completedSteps: [],
        skippedSteps: [],
        progress: legacyDone ? 100 : 0,
        lastVisitedStep: ONBOARDING_STEPS.SCHOOL_PROFILE,
        ...(legacyDone ? { completedAt: new Date() } : {}),
    };

    if (session) {
        const [created] = await Onboarding.create([data], { session });
        return created;
    }

    return Onboarding.create(data);
};

// ------------------------------------------------------------
// DERIVE STEP STATE FROM REAL DATA
// ------------------------------------------------------------

export const deriveStepStates = async (schoolId, session = null) => {
    validateSchoolId(schoolId);

    const school = await inSession(
        School.findById(schoolId)
            .select("name email phone address city onboardingCompleted setupCompleted")
            .lean(),
        session
    );

    const counts = {};
    const completed = new Set();

    // School profile: the essentials must be filled in
    counts[ONBOARDING_STEPS.SCHOOL_PROFILE] = 0;
    if (
        school?.name?.trim() &&
        school?.email?.trim() &&
        school?.phone?.trim() &&
        (school?.address?.trim() || school?.city?.trim())
    ) {
        counts[ONBOARDING_STEPS.SCHOOL_PROFILE] = 1;
        completed.add(ONBOARDING_STEPS.SCHOOL_PROFILE);
    }

    await Promise.all(
        Object.entries(DATA_MODELS).map(async ([step, Model]) => {
            const count = await inSession(
                Model.countDocuments({
                    school: schoolId,
                    isDeleted: { $ne: true },
                }),
                session
            );
            counts[step] = count;
            if (count > 0) completed.add(step);
        })
    );

    return {
        completedSteps: STEP_SEQUENCE.filter((s) => completed.has(s)),
        counts,
        legacyCompleted: Boolean(
            school?.onboardingCompleted || school?.setupCompleted
        ),
    };
};

// ------------------------------------------------------------
// APPLY DERIVED STATE TO THE ONBOARDING DOCUMENT
// ------------------------------------------------------------

const applyState = (onboarding, derived) => {
    const completedSteps = derived.completedSteps;

    // skipped = only optional steps that are still not completed
    const skippedSteps = STEP_SEQUENCE.filter(
        (step) =>
            OPTIONAL_SETUP_STEPS.includes(step) &&
            (onboarding.skippedSteps || []).includes(step) &&
            !completedSteps.includes(step)
    );

    const resolved = new Set([...completedSteps, ...skippedSteps]);

    const alreadyFinished =
        onboarding.status === ONBOARDING_STATUS.COMPLETED ||
        derived.legacyCompleted;

    onboarding.completedSteps = completedSteps;
    onboarding.skippedSteps = skippedSteps;

    const nextStep =
        STEP_SEQUENCE.find((step) => !resolved.has(step)) ||
        ONBOARDING_STEPS.COMPLETED;

    if (alreadyFinished) {
        // sticky: a finished school never goes back to the wizard
        onboarding.status = ONBOARDING_STATUS.COMPLETED;
        onboarding.progress = 100;
        onboarding.currentStep = ONBOARDING_STEPS.COMPLETED;
        if (!onboarding.completedAt) onboarding.completedAt = new Date();
    } else {
        onboarding.status = ONBOARDING_STATUS.IN_PROGRESS;
        onboarding.progress = Math.round(
            (resolved.size / STEP_SEQUENCE.length) * 100
        );
        onboarding.currentStep = nextStep;
    }

    if (!onboarding.lastVisitedStep) {
        onboarding.lastVisitedStep = onboarding.currentStep;
    }

    return onboarding;
};

export const syncSchoolCache = async (
    schoolId,
    onboarding,
    session = null,
    completedSteps = null
) => {
    validateSchoolId(schoolId);
    if (!onboarding) throw new Error("Onboarding document is required.");

    const done = onboarding.status === ONBOARDING_STATUS.COMPLETED;
    const steps = completedSteps || onboarding.completedSteps || [];

    const $set = {
        onboardingCompleted: done,
        onboardingPercentage: onboarding.progress,
        currentSetupStep: onboarding.currentStep,
        setupProgress: onboarding.progress,
        setupCompleted: done,
    };

    Object.entries(LEGACY_FLAGS).forEach(([step, flag]) => {
        $set[`setup.${flag}`] = steps.includes(step);
    });

    await School.findByIdAndUpdate(
        schoolId,
        { $set },
        { session: session || undefined }
    );
};

// Recompute from data, persist, sync cache.
const recompute = async (schoolId, session = null, mutate = null) => {
    const onboarding = await getOrCreateOnboarding(schoolId, session);
    if (mutate) mutate(onboarding);

    const derived = await deriveStepStates(schoolId, session);
    applyState(onboarding, derived);

    await onboarding.save(session ? { session } : undefined);
    await syncSchoolCache(schoolId, onboarding, session, derived.completedSteps);

    return { onboarding, derived };
};

export const refreshOnboardingState = async (schoolId, session = null) =>
    (await recompute(schoolId, session)).onboarding;

export const refreshProgress = refreshOnboardingState;

// ------------------------------------------------------------
// PUBLIC PAYLOAD
// ------------------------------------------------------------

const buildStepList = (onboarding, derived) =>
    STEP_SEQUENCE.map((step) => ({
        step,
        key: STEP_META[step].key,
        route: STEP_META[step].route,
        description: STEP_META[step].description,
        optional: OPTIONAL_SETUP_STEPS.includes(step),
        completed: onboarding.completedSteps.includes(step),
        skipped: onboarding.skippedSteps.includes(step),
        count: derived.counts[step] ?? 0,
    }));

export const serializeOnboarding = (onboarding, derived) => {
    const completed = onboarding.status === ONBOARDING_STATUS.COMPLETED;

    const canComplete = REQUIRED_SETUP_STEPS.every((step) =>
        onboarding.completedSteps.includes(step)
    );

    return {
        status: onboarding.status,
        progress: onboarding.progress,
        currentStep: onboarding.currentStep,
        completedSteps: onboarding.completedSteps,
        skippedSteps: onboarding.skippedSteps,
        requiredSteps: REQUIRED_SETUP_STEPS,
        optionalSteps: OPTIONAL_SETUP_STEPS,
        remainingRequired: REQUIRED_SETUP_STEPS.filter(
            (step) => !onboarding.completedSteps.includes(step)
        ),
        canComplete,
        completed,
        lastVisitedStep: onboarding.lastVisitedStep,
        steps: buildStepList(onboarding, derived),
    };
};

export const getStatus = async (schoolId) => {
    const { onboarding, derived } = await recompute(schoolId);
    return { success: true, onboarding: serializeOnboarding(onboarding, derived) };
};

// ------------------------------------------------------------
// STEP MUTATIONS (kept for the existing setup* services)
// Completion is derived, so "marking" just records the visit and
// re-derives; it can never mark a step done without data.
// ------------------------------------------------------------

export const markStepCompleted = async (schoolId, step, session = null) => {
    validateStep(step);
    const { onboarding } = await recompute(schoolId, session, (doc) => {
        doc.lastVisitedStep = step;
    });
    return onboarding;
};

export const markStepIncomplete = markStepCompleted;

export const skipStep = async (schoolId, step) => {
    validateStep(step);

    if (!OPTIONAL_SETUP_STEPS.includes(step)) {
        const error = new Error(
            `"${step}" is required and cannot be skipped.`
        );
        error.status = 400;
        error.statusCode = 400;
        throw error;
    }

    const { onboarding, derived } = await recompute(schoolId, null, (doc) => {
        const skipped = new Set(doc.skippedSteps || []);
        skipped.add(step);
        doc.skippedSteps = [...skipped];
        doc.lastVisitedStep = step;
    });

    return { success: true, onboarding: serializeOnboarding(onboarding, derived) };
};

export const unskipStep = async (schoolId, step) => {
    validateStep(step);

    const { onboarding, derived } = await recompute(schoolId, null, (doc) => {
        doc.skippedSteps = (doc.skippedSteps || []).filter((s) => s !== step);
    });

    return { success: true, onboarding: serializeOnboarding(onboarding, derived) };
};

// ------------------------------------------------------------
// FINISH / RESET
// ------------------------------------------------------------

export const finishOnboarding = async (schoolId, userId = null) => {
    const { onboarding, derived } = await recompute(schoolId);

    const missing = REQUIRED_SETUP_STEPS.filter(
        (step) => !onboarding.completedSteps.includes(step)
    );

    if (missing.length) {
        const error = new Error(
            `Complete these required steps first: ${missing
                .map((s) => STEP_META[s].key)
                .join(", ")}.`
        );
        error.status = 400;
        error.statusCode = 400;
        error.missingSteps = missing;
        throw error;
    }

    onboarding.status = ONBOARDING_STATUS.COMPLETED;
    onboarding.progress = 100;
    onboarding.currentStep = ONBOARDING_STEPS.COMPLETED;
    onboarding.completedAt = new Date();
    if (userId) onboarding.completedBy = userId;
    await onboarding.save();

    await syncSchoolCache(schoolId, onboarding, null, derived.completedSteps);
    await School.findByIdAndUpdate(schoolId, {
        $set: { setupCompletedAt: new Date() },
    });

    return { success: true, onboarding: serializeOnboarding(onboarding, derived) };
};

export const resetOnboarding = async (schoolId) => {
    const onboarding = await getOrCreateOnboarding(schoolId);
    onboarding.status = ONBOARDING_STATUS.IN_PROGRESS;
    onboarding.skippedSteps = [];
    onboarding.completedAt = null;
    onboarding.completedBy = null;
    await onboarding.save();

    // School flags must be cleared BEFORE recompute (legacy sticky rule)
    await School.findByIdAndUpdate(schoolId, {
        $set: { onboardingCompleted: false, setupCompleted: false },
    });

    const { onboarding: fresh, derived } = await recompute(schoolId);
    return { success: true, onboarding: serializeOnboarding(fresh, derived) };
};

export const updateSchoolCompletion = async (schoolId, session = null) => {
    const onboarding = await refreshOnboardingState(schoolId, session);
    return {
        success: true,
        onboardingCompleted: onboarding.status === ONBOARDING_STATUS.COMPLETED,
        progress: onboarding.progress,
        currentStep: onboarding.currentStep,
    };
};

// ------------------------------------------------------------
// SUMMARY (setup overview screen)
// ------------------------------------------------------------

export const getProgressSummary = async (schoolId) => {
    const { onboarding, derived } = await recompute(schoolId);
    const payload = serializeOnboarding(onboarding, derived);

    const school = await School.findById(schoolId)
        .select("name code email phone logo address city state onboardingCompleted onboardingPercentage currentSetupStep")
        .lean();

    const sessions = await AcademicSession.find({
        school: schoolId,
        isDeleted: { $ne: true },
    })
        .select("name isCurrent status startDate endDate")
        .sort({ startDate: -1 })
        .lean();

    const items = payload.steps.map((s) => ({
        key: s.key,
        step: s.step,
        title: s.step
            .split("_")
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" "),
        description: s.description,
        completed: s.completed,
        skipped: s.skipped,
        optional: s.optional,
        route: s.route,
    }));

    const next = payload.steps.find((s) => !s.completed && !s.skipped);
    const c = derived.counts;

    return {
        success: true,
        school,
        onboarding: payload,
        counts: c,
        // list consumed by useAcademicSession
        statistics: { academicSessions: sessions },
        overview: {
            progress: {
                completed: payload.completedSteps.length,
                total: STEP_SEQUENCE.length,
                percentage: payload.progress,
                items,
            },
            summary: {
                profile: school?.name || "",
                sessions: c[ONBOARDING_STEPS.ACADEMIC_SESSION],
                terms: c[ONBOARDING_STEPS.TERMS],
                classes: c[ONBOARDING_STEPS.CLASSES],
                arms: c[ONBOARDING_STEPS.ARMS],
                subjects: c[ONBOARDING_STEPS.SUBJECTS],
                departments: c[ONBOARDING_STEPS.DEPARTMENTS],
                houses: c[ONBOARDING_STEPS.HOUSES],
                fees: c[ONBOARDING_STEPS.FEE_STRUCTURE],
                grading: c[ONBOARDING_STEPS.GRADING_SYSTEM],
            },
            nextAction:
                payload.completed || !next
                    ? null
                    : {
                          title: `Set up ${next.key}`,
                          description: next.description,
                          route: next.route,
                      },
        },
        nextAction: {
            step: onboarding.currentStep,
            message: payload.completed
                ? "School setup completed."
                : payload.canComplete
                ? "All required steps are done. Finish setup."
                : "Continue school setup.",
        },
    };
};

export default {
    getOrCreateOnboarding,
    syncSchoolCache,
    refreshOnboardingState,
    refreshProgress,
    getStatus,
    markStepCompleted,
    markStepIncomplete,
    skipStep,
    unskipStep,
    finishOnboarding,
    resetOnboarding,
    updateSchoolCompletion,
    getProgressSummary,
    deriveStepStates,
    serializeOnboarding,
};
