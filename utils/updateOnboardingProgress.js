// ============================================================
// backend/utils/updateOnboardingProgress.js
// SchoolBridge Enterprise
// Automatic Onboarding Progress Calculator
// ============================================================

import School from "../models/School.js";
import AcademicSession from "../models/AcademicSession.js";
import Term from "../models/Term.js";
import Class from "../models/Class.js";
import Subject from "../models/Subject.js";
import Department from "../models/Department.js";
import House from "../models/House.js";
import FeeStructure from "../models/FeeStructure.js";
import GradingSystem from "../models/GradingSystem.js";
import progressService from "../services/onboarding/progressService.js";

/*
============================================================
UPDATE ONBOARDING PROGRESS
============================================================
*/

export const updateOnboardingProgress = async ({
    schoolId,
    session = null,
}) => {

    if (!schoolId) {
        throw new Error("schoolId is required.");
    }

    /*
    ============================================================
    LOAD SCHOOL
    ============================================================
    */

    const school = await School.findById(
        schoolId
    ).session(session);

    if (!school) {
        throw new Error("School not found.");
    }

    /*
    ============================================================
    ENSURE SETUP OBJECT EXISTS
    ============================================================
    */

    if (!school.setup) {
        school.setup = {};
    }

    /*
    ============================================================
    CHECK EACH SETUP STEP
    ============================================================
    */

    const [
        academicSessionCount,
        termCount,
        classCount,
        subjectCount,
        departmentCount,
        houseCount,
        feeStructureCount,
        gradingSystemCount,
    ] = await Promise.all([

        AcademicSession.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

        Term.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

        Class.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

        Subject.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

        Department.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

        House.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

        FeeStructure.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

        GradingSystem.countDocuments({
            school: schoolId,
            isDeleted: false,
        }).session(session),

    ]);

    /*
    ============================================================
    SCHOOL PROFILE
    ============================================================
    */

    school.setup.schoolProfile = Boolean(
        school.name &&
        school.email &&
        school.phone
    );

    /*
    ============================================================
    OTHER STEPS
    ============================================================
    */

    school.setup.academicSession =
        academicSessionCount > 0;

    school.setup.terms =
        termCount > 0;

    school.setup.classes =
        classCount > 0;

    school.setup.subjects =
        subjectCount > 0;

    school.setup.departments =
        departmentCount > 0;

    school.setup.houses =
        houseCount > 0;

    school.setup.feeStructure =
        feeStructureCount > 0;

    school.setup.gradingSystem =
        gradingSystemCount > 0;

    /*
    ============================================================
    RECALCULATE PROGRESS
    ============================================================
    */

    school.calculateSetupProgress();

await school.save({
    session,
});

/*
============================================================
SYNC ONBOARDING DOCUMENT
============================================================
*/

if (school.setup.schoolProfile) {
    await progressService.markStepCompleted(
        schoolId,
        "school_profile"
    );
}

if (school.setup.academicSession) {
    await progressService.markStepCompleted(
        schoolId,
        "academic_session"
    );
}

if (school.setup.terms) {
    await progressService.markStepCompleted(
        schoolId,
        "terms"
    );
}

if (school.setup.classes) {
    await progressService.markStepCompleted(
        schoolId,
        "classes"
    );
}

if (school.setup.subjects) {
    await progressService.markStepCompleted(
        schoolId,
        "subjects"
    );
}

if (school.setup.departments) {
    await progressService.markStepCompleted(
        schoolId,
        "departments"
    );
}

if (school.setup.houses) {
    await progressService.markStepCompleted(
        schoolId,
        "houses"
    );
}

if (school.setup.feeStructure) {
    await progressService.markStepCompleted(
        schoolId,
        "fee_structure"
    );
}

if (school.setup.gradingSystem) {
    await progressService.markStepCompleted(
        schoolId,
        "grading_system"
    );
}

return school;
};