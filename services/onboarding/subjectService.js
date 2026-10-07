// ============================================================
// backend/services/onboarding/subjectService.js
// SchoolBridge Enterprise
// Subject Service
// ============================================================


import Subject from "../../models/Subject.js";
import School from "../../models/School.js";


import {
    ONBOARDING_STEPS
} from "./constants.js";


import {
    markStepCompleted
} from "./progressService.js";


import {
    isValidObjectId,
    cleanString
} from "./helpers.js";




// ============================================================
// GENERATE SUBJECT CODE
// ============================================================

const generateSubjectCode = (

    name = ""

) => {

    return cleanString(name)
        .replace(/[^a-zA-Z]/g,"")
        .substring(0,3)
        .toUpperCase();

};




// ============================================================
// VALIDATION
// ============================================================

const validateSubjects = (

    subjects = []

) => {


    if(

        !Array.isArray(subjects)

        ||

        subjects.length === 0

    ){

        throw new Error(
            "At least one subject is required."
        );

    }



    subjects.forEach(

        (subject,index)=>{


            if(!subject.name){

                throw new Error(

                    `Subject ${index + 1} name is required.`

                );

            }


        }

    );


};




// ============================================================
// DUPLICATE CHECK
// ============================================================

const checkDuplicateSubjects = async (

    schoolId,

    subjects

)=>{


    const names =

        subjects.map(

            subject =>

            cleanString(
                subject.name
            )
            .toLowerCase()

        );



    const existing =

        await Subject.find({

            school:
                schoolId,


            name:
            {
                $in:names
            }

        });



    if(existing.length){

        throw new Error(
            "Some subjects already exist."
        );

    }


};




// ============================================================
// CREATE SUBJECTS
// ============================================================

export const createSubjects = async (

    schoolId,

    subjects

)=>{


    if(!isValidObjectId(schoolId)){

        throw new Error(
            "Invalid school ID."
        );

    }



    validateSubjects(
        subjects
    );



    const schoolDoc =

        await School.findById(
            schoolId
        );



    if(!schoolDoc){

        throw new Error(
            "School not found."
        );

    }



    await checkDuplicateSubjects(

        schoolId,

        subjects

    );





    const formattedSubjects =


        subjects.map(

            subject => ({


                school:
                    schoolId,


                name:
                    cleanString(
                        subject.name
                    ),



                code:

                    subject.code ||

                    generateSubjectCode(
                        subject.name
                    ),



                category:

                    subject.category ||

                    "General",



                compulsory:

                    subject.compulsory ?? true,



                description:

                    subject.description ||

                    "",



                isActive:

                    true


            })

        );





    const createdSubjects =

        await Subject.insertMany(

            formattedSubjects

        );





    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.SUBJECTS

    );





    return createdSubjects;


};

// ============================================================
// UPDATE SINGLE SUBJECT
// ============================================================

export const updateSubject = async (

    subjectId,

    updateData

) => {


    if(!isValidObjectId(subjectId)){

        throw new Error(
            "Invalid subject ID."
        );

    }



    const subject =

        await Subject.findById(
            subjectId
        );



    if(!subject){

        throw new Error(
            "Subject not found."
        );

    }




    /*
    ------------------------------------------------
    Normalize fields
    ------------------------------------------------
    */


    if(updateData.name){

        updateData.name =

            cleanString(
                updateData.name
            );

    }




    if(
        updateData.name &&
        !updateData.code
    ){

        updateData.code =

            generateSubjectCode(
                updateData.name
            );

    }





    if(updateData.code){

        updateData.code =

            cleanString(
                updateData.code
            )
            .toUpperCase();

    }





    Object.assign(

        subject,

        updateData

    );




    await subject.save();




    return subject;


};




// ============================================================
// BULK UPDATE SUBJECTS
// Replace all subjects for school
// ============================================================

export const updateSubjects = async (

    schoolId,

    subjects

) => {


    if(!isValidObjectId(schoolId)){

        throw new Error(
            "Invalid school ID."
        );

    }



    validateSubjects(
        subjects
    );



    const schoolDoc =

        await School.findById(
            schoolId
        );



    if(!schoolDoc){

        throw new Error(
            "School not found."
        );

    }





    await Subject.deleteMany({

        school:
            schoolId

    });






    const recreatedSubjects =


        await Subject.insertMany(


            subjects.map(

                subject => ({


                    school:

                        schoolId,



                    name:

                        cleanString(
                            subject.name
                        ),



                    code:

                        subject.code ||

                        generateSubjectCode(
                            subject.name
                        ),



                    category:

                        subject.category ||

                        "General",



                    compulsory:

                        subject.compulsory ?? true,



                    description:

                        subject.description ||

                        "",



                    isActive:

                        true


                })

            )

        );





    return recreatedSubjects;


};




// ============================================================
// GET ALL SUBJECTS
// ============================================================

export const getSubjects = async (

    schoolId

) => {


    if(!isValidObjectId(schoolId)){

        throw new Error(
            "Invalid school ID."
        );

    }



    return await Subject.find({

        school:
            schoolId,


        isDeleted: { $ne: true }

    })

    .sort({

        name:
            1

    });


};




// ============================================================
// GET SINGLE SUBJECT
// ============================================================

export const getSubject = async (

    subjectId

) => {


    if(!isValidObjectId(subjectId)){

        throw new Error(
            "Invalid subject ID."
        );

    }




    const subject =

        await Subject.findById(
            subjectId
        );




    if(!subject){

        throw new Error(
            "Subject not found."
        );

    }




    return subject;


};

// ============================================================
// DELETE SUBJECT
// ============================================================

export const deleteSubject = async (

    subjectId

) => {


    if(!isValidObjectId(subjectId)){

        throw new Error(
            "Invalid subject ID."
        );

    }




    const subject =

        await Subject.findById(
            subjectId
        );




    if(!subject){

        throw new Error(
            "Subject not found."
        );

    }




    await subject.deleteOne();




    return {


        success:
            true,


        message:
            "Subject deleted successfully."

    };


};




// ============================================================
// CONTROLLER COMPATIBILITY WRAPPER
//
// Used by onboarding wizard
//
// ============================================================

export const setupSubjects = async (

    schoolId,

    subjects

) => {


    return await createSubjects(

        schoolId,

        subjects

    );


};




// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Onboarding compatibility
    */

    setupSubjects,



    /*
    CRUD
    */

    createSubjects,

    updateSubject,

    updateSubjects,

    getSubjects,

    getSubject,

    deleteSubject


};