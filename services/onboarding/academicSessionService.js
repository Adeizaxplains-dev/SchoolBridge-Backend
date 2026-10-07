// ============================================================
// backend/services/onboarding/academicSessionService.js
// SchoolBridge Enterprise
// Academic Session Service
//
// Part 1
//
// - Imports
// - Validation Helpers
// - Create Academic Session
// ============================================================

import AcademicSession from "../../models/AcademicSession.js";
import School from "../../models/School.js";

import {
    ONBOARDING_STEPS
} from "./constants.js";

import {
    isValidObjectId,
    ensureRequiredFields,
    cleanString
} from "./helpers.js";

import {
    markStepCompleted
} from "./progressService.js";



// ============================================================
// VALIDATION
// ============================================================

const validateSessionData = (data = {}) => {

    ensureRequiredFields(

        data,

        [
            "name",
            "startDate",
            "endDate"
        ]

    );

    const startDate = new Date(data.startDate);

    const endDate = new Date(data.endDate);

    if (Number.isNaN(startDate.getTime())) {

        throw new Error(
            "Invalid start date."
        );

    }

    if (Number.isNaN(endDate.getTime())) {

        throw new Error(
            "Invalid end date."
        );

    }

    if (startDate >= endDate) {

        throw new Error(
            "End date must be after start date."
        );

    }

};



// ============================================================
// CREATE ACADEMIC SESSION
// ============================================================

export const createAcademicSession = async (

    schoolId,

    data

) => {

    if (!isValidObjectId(schoolId)) {

        throw new Error(
            "Invalid school ID."
        );

    }

    validateSessionData(data);

    const schoolDoc =

        await School.findById(
            schoolId
        );

    if (!schoolDoc) {

        throw new Error(
            "School not found."
        );

    }

    const sessionName =

        cleanString(data.name);

    /*
    ------------------------------------------------
    Prevent duplicate session names
    ------------------------------------------------
    */

    const existingSession =

        await AcademicSession.findOne({

            school: schoolId,

            name: sessionName,

            isDeleted: false

        });

    if (existingSession) {

        throw new Error(
            "Academic session already exists."
        );

    }

    /*
    ------------------------------------------------
    Only one current session per school
    ------------------------------------------------
    */

    if (data.isCurrent !== false) {

        await AcademicSession.updateMany(

            {

                school: schoolId,

                isCurrent: true

            },

            {

                isCurrent: false

            }

        );

    }

    /*
    ------------------------------------------------
    Create session
    ------------------------------------------------
    */

    const session =

        await AcademicSession.create({

            school: schoolId,

            name: sessionName,

            code:

                data.code
                    ?.trim()
                    ?.toUpperCase(),

            description:

                data.description || "",

            startDate:

                new Date(data.startDate),

            endDate:

                new Date(data.endDate),

            status:

                data.status || "active",

            isCurrent:

                data.isCurrent !== false,

            createdBy:

                data.createdBy || null

        });

    /*
    ------------------------------------------------
    Update school's current session
    ------------------------------------------------
    */

    if (session.isCurrent) {

        schoolDoc.currentAcademicSession =

            session._id;

        await schoolDoc.save();

    }

    /*
    ------------------------------------------------
    Complete onboarding step
    ------------------------------------------------
    */

    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.ACADEMIC_SESSION

    );

    return session;

};

// ============================================================
// UPDATE ACADEMIC SESSION
// ============================================================

export const updateAcademicSession = async (

    sessionId,

    data

) => {

    if (!isValidObjectId(sessionId)) {

        throw new Error(
            "Invalid academic session ID."
        );

    }


    const session =

        await AcademicSession.findById(
            sessionId
        );


    if (!session) {

        throw new Error(
            "Academic session not found."
        );

    }


  
    /*
    ------------------------------------------------
    Update name
    ------------------------------------------------
    */

    if (data.name) {


        const sessionName =

            cleanString(
                data.name
            );


        const duplicate =

            await AcademicSession.findOne({

                school:
                    session.school,

                name:
                    sessionName,

                _id:
                    {
                        $ne:
                            session._id
                    },

                isDeleted:false

            });



        if (duplicate) {

            throw new Error(
                "Academic session already exists."
            );

        }


        session.name =
            sessionName;

    }



    /*
    ------------------------------------------------
    Update fields
    ------------------------------------------------
    */

    if (data.code !== undefined) {

        session.code =

            data.code
                ?.trim()
                ?.toUpperCase();

    }


    if (data.description !== undefined) {

        session.description =
            data.description;

    }


    if (data.status !== undefined) {

        session.status =
            data.status;

    }


    if (data.startDate) {

        session.startDate =
            new Date(data.startDate);

    }


    if (data.endDate) {

        session.endDate =
            new Date(data.endDate);

    }

    /*
------------------------------------------------
Validate updated dates
------------------------------------------------
*/

if (
    session.startDate >= session.endDate
) {

    throw new Error(
        "End date must be after start date."
    );

}


    if (data.updatedBy) {

        session.updatedBy =
            data.updatedBy;

    }



    /*
    ------------------------------------------------
    Make current session
    ------------------------------------------------
    */

    if (data.isCurrent === true) {


        await AcademicSession.updateMany(

            {

                school:
                    session.school

            },

            {

                isCurrent:false

            }

        );


        session.isCurrent = true;



        await School.findByIdAndUpdate(

            session.school,

            {

                currentAcademicSession:
                    session._id

            }

        );


    }



    await session.save();



    return session;

};



// ============================================================
// GET CURRENT ACADEMIC SESSION
// ============================================================

export const getCurrentSession = async (

    schoolId

) => {


    if (!isValidObjectId(schoolId)) {

        throw new Error(
            "Invalid school ID."
        );

    }



    return await AcademicSession.findOne({

        school:
            schoolId,

        isCurrent:
            true,

        isDeleted:
            false

    });

};



// ============================================================
// GET ALL ACADEMIC SESSIONS
// ============================================================

export const getAcademicSessions = async (

    schoolId

) => {


    if (!isValidObjectId(schoolId)) {

        throw new Error(
            "Invalid school ID."
        );

    }



    return await AcademicSession.find({

        school:
            schoolId,

        isDeleted:
            false

    })

    .sort({

        startDate:
            -1

    });

};

// ============================================================
// DELETE ACADEMIC SESSION
// SOFT DELETE
// ============================================================

export const deleteAcademicSession = async (

    sessionId

) => {


    if (!isValidObjectId(sessionId)) {

        throw new Error(
            "Invalid academic session ID."
        );

    }



    const session =

        await AcademicSession.findById(
            sessionId
        );



    if (!session) {

        throw new Error(
            "Academic session not found."
        );

    }



    /*
    ------------------------------------------------
    Prevent deleting current session
    ------------------------------------------------
    */

    if (session.isCurrent) {

        throw new Error(
            "Current academic session cannot be deleted."
        );

    }



    session.isDeleted = true;


    await session.save();



    return {

        success:true,

        message:
            "Academic session deleted successfully."

    };

};



// ============================================================
// CONTROLLER COMPATIBILITY ALIAS
// ============================================================

export const setupAcademicSession = async (

    schoolId,

    data

) => {


    return await createAcademicSession(

        schoolId,

        data

    );

};



// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Controller compatibility
    */

    setupAcademicSession,


    /*
    CRUD
    */

    createAcademicSession,

    updateAcademicSession,

    getCurrentSession,

    getAcademicSessions,

    deleteAcademicSession


};