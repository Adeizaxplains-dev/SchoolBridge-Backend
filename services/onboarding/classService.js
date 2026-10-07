// ============================================================
// backend/services/onboarding/classService.js
// SchoolBridge Enterprise
// Class Service
// ============================================================


import Class from "../../models/Class.js";
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
// VALIDATION
// ============================================================

const validateClasses = (classes = []) => {

    if (
        !Array.isArray(classes) ||
        classes.length === 0
    ) {

        throw new Error(
            "At least one class is required."
        );

    }

    const names = [];

    classes.forEach((item, index) => {

        if (!item.name) {

            throw new Error(
                `Class ${index + 1} name is required.`
            );

        }

        const normalizedName =
            cleanString(item.name).toLowerCase();

        if (names.includes(normalizedName)) {

            throw new Error(
                `Duplicate class name: ${item.name}`
            );

        }

        names.push(normalizedName);

    });

};




// ============================================================
// DUPLICATE CHECK
// ============================================================

const checkDuplicateClasses = async (

    schoolId,

    classes

) => {

    for (const item of classes) {

        const existing = await Class.findOne({

            school: schoolId,

            name: cleanString(item.name)

        });

        if (existing) {

            throw new Error(
                `${item.name} already exists.`
            );

        }

    }

};




// ============================================================
// CREATE CLASSES
// ============================================================

export const createClasses = async (

    schoolId,

    classes

)=>{


    if (!isValidObjectId(schoolId)) {

        throw new Error(
            "Invalid school ID."
        );

    }



    validateClasses(classes);



    const schoolDoc =

        await School.findById(
            schoolId
        );



    if(!schoolDoc){

        throw new Error(
            "School not found."
        );

    }



    await checkDuplicateClasses(

        schoolId,

        classes

    );




    const formattedClasses =


        classes.map(

            (item,index)=>({


                school:
                    schoolId,


                name:
                    cleanString(
                        item.name
                    ),


                shortName:

                    item.shortName ||

                    cleanString(
                        item.name
                    )
                    .substring(0,3)
                    .toUpperCase(),


                level:

                    item.level ||

                    index + 1,


                section:

                    item.section ||

                    "A",


                capacity:

                    item.capacity ||

                    0,


                description:

                    item.description ||

                    "",


                isActive:

                    true


            })

        );




    const createdClasses =

        await Class.insertMany(

            formattedClasses

        );




    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.CLASSES

    );



    return createdClasses;


};

// ============================================================
// UPDATE SINGLE CLASS
// ============================================================

export const updateClass = async (

    classId,

    updateData

) => {


    if (!isValidObjectId(classId)) {

        throw new Error(
            "Invalid class ID."
        );

    }



    const classRecord =

        await Class.findById(
            classId
        );



    if (!classRecord) {

        throw new Error(
            "Class not found."
        );

    }



    /*
    ------------------------------------------------
    Clean editable fields
    ------------------------------------------------
    */


    if (updateData.name) {

        updateData.name =
            cleanString(
                updateData.name
            );

    }



    if (updateData.shortName) {

        updateData.shortName =
            cleanString(
                updateData.shortName
            )
            .toUpperCase();

    }



    Object.assign(

        classRecord,

        updateData

    );



    await classRecord.save();



    return classRecord;


};




// ============================================================
// BULK UPDATE CLASSES
// Replace all classes for a school
// ============================================================

export const updateClasses = async (

    schoolId,

    classes

) => {


    if (!isValidObjectId(schoolId)) {

        throw new Error(
            "Invalid school ID."
        );

    }



    validateClasses(classes);



    const schoolDoc =

        await School.findById(
            schoolId
        );



    if (!schoolDoc) {

        throw new Error(
            "School not found."
        );

    }



    /*
    ------------------------------------------------
    Remove existing classes
    ------------------------------------------------
    */

    await Class.deleteMany({

        school:
            schoolId

    });



    /*
    ------------------------------------------------
    Recreate classes
    ------------------------------------------------
    */


    const recreatedClasses =

        await Class.insertMany(


            classes.map(

                (item,index)=>({


                    school:
                        schoolId,


                    name:
                        cleanString(
                            item.name
                        ),



                    shortName:

                        item.shortName ||

                        cleanString(
                            item.name
                        )
                        .substring(0,3)
                        .toUpperCase(),



                    level:

                        item.level ||

                        index + 1,



                    section:

                        item.section ||

                        "A",



                    capacity:

                        item.capacity ||

                        0,



                    description:

                        item.description ||

                        "",



                    isActive:

                        true


                })

            )

        );



    return recreatedClasses;


};




// ============================================================
// GET ALL CLASSES
// ============================================================

export const getClasses = async (

    schoolId

) => {


    if (!isValidObjectId(schoolId)) {

        throw new Error(
            "Invalid school ID."
        );

    }



    return await Class.find({

        school:
            schoolId,

        isDeleted: { $ne: true }

    })

    .sort({

        level:
            1

    });


};




// ============================================================
// GET SINGLE CLASS
// ============================================================

export const getClass = async (

    classId

) => {


    if (!isValidObjectId(classId)) {

        throw new Error(
            "Invalid class ID."
        );

    }



    const classRecord =

        await Class.findById(
            classId
        );



    if (!classRecord) {

        throw new Error(
            "Class not found."
        );

    }



    return classRecord;


};

// ============================================================
// DELETE CLASS
// ============================================================

export const deleteClass = async (

    classId

) => {


    if (!isValidObjectId(classId)) {

        throw new Error(
            "Invalid class ID."
        );

    }



    const classRecord =

        await Class.findById(
            classId
        );



    if (!classRecord) {

        throw new Error(
            "Class not found."
        );

    }



    /*
    ------------------------------------------------
    Prevent deleting active records if required
    ------------------------------------------------
    */

    await classRecord.deleteOne();



    return {

        success:
            true,


        message:
            "Class deleted successfully."

    };


};




// ============================================================
// CONTROLLER COMPATIBILITY WRAPPER
//
// Used by onboarding wizard
//
// ============================================================

export const setupClasses = async (

    schoolId,

    classes

) => {


    return await createClasses(

        schoolId,

        classes

    );


};




// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Onboarding compatibility
    */

    setupClasses,


    /*
    CRUD
    */

    createClasses,

    updateClass,

    updateClasses,

    getClasses,

    getClass,

    deleteClass


};