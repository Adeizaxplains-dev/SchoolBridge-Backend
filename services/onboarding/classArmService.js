// ============================================================
// backend/services/onboarding/classArmService.js
// SchoolBridge Enterprise
// Class Arm Service
// ============================================================


import ClassArm from "../../models/ClassArm.js";
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

const validateClassArms = (arms = []) => {

    if (
        !Array.isArray(arms) ||
        arms.length === 0
    ) {

        throw new Error(
            "At least one class arm is required."
        );

    }

    const combinations = [];

    arms.forEach((arm, index) => {

        if (!arm.name) {

            throw new Error(
                `Class arm ${index + 1} name is required.`
            );

        }

        const key = `${String(arm.classId || "school")}-${cleanString(arm.name).toLowerCase()}`;

        if (combinations.includes(key)) {

            throw new Error(
                `Duplicate arm "${arm.name}" for the same class.`
            );

        }

        combinations.push(key);

    });

};




// ============================================================
// DUPLICATE CHECK
// ============================================================

const checkDuplicateClassArms = async (

    schoolId,

    arms

) => {

    for (const arm of arms) {

        const existing = await ClassArm.findOne({

            school: schoolId,

            class: arm.classId || null,

            name: cleanString(arm.name)

        });

        if (existing) {

            throw new Error(
                `${arm.name} already exists for this class.`
            );

        }

    }

};




// ============================================================
// CREATE CLASS ARMS
// ============================================================

export const createClassArms = async (

    schoolId,

    arms

)=>{


    if(!isValidObjectId(schoolId)){

        throw new Error(
            "Invalid school ID."
        );

    }



    validateClassArms(
        arms
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



    /*
    ------------------------------------------------
    Validate classes belong to school
    ------------------------------------------------
    */


    const classIds =
        arms.map(
            arm => arm.classId
        ).filter(Boolean);



    const classes =

        await Class.find({

            _id:
                {
                    $in:classIds
                },

            school:
                schoolId

        });



    if(
        classIds.length &&
        classes.length !==
        [...new Set(classIds.map(String))].length
    ){

        throw new Error(
            "Invalid class reference detected."
        );

    }




    await checkDuplicateClassArms(

        schoolId,

        arms

    );





    const formattedArms =


        arms.map(

            arm => ({


                school:
                    schoolId,


                class:
                    arm.classId || null,


                name:
                    cleanString(
                        arm.name
                    ),


                shortName:

                    arm.shortName ||

                    cleanString(
                        arm.name
                    )
                    .substring(0,3)
                    .toUpperCase(),



                capacity:

                    arm.capacity ||

                    0,



                description:

                    arm.description ||

                    "",



                isActive:

                    true


            })

        );





    const createdArms =

        await ClassArm.insertMany(

            formattedArms

        );





    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.ARMS

    );





    return createdArms;


};

// ============================================================
// UPDATE SINGLE CLASS ARM
// ============================================================

export const updateClassArm = async (

    armId,

    updateData

) => {


    if(!isValidObjectId(armId)){

        throw new Error(
            "Invalid class arm ID."
        );

    }



    const arm =

        await ClassArm.findById(
            armId
        );



    if(!arm){

        throw new Error(
            "Class arm not found."
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



    if(updateData.shortName){

        updateData.shortName =

            cleanString(
                updateData.shortName
            )
            .toUpperCase();

    }



    /*
    ------------------------------------------------
    Update class reference
    ------------------------------------------------
    */


    if(updateData.classId){


        if(
            !isValidObjectId(
                updateData.classId
            )
        ){

            throw new Error(
                "Invalid class ID."
            );

        }



        const classRecord =

            await Class.findOne({

                _id:
                    updateData.classId,

                school:
                    arm.school

            });



        if(!classRecord){

            throw new Error(
                "Class does not belong to this school."
            );

        }



        arm.class =
            updateData.classId;


        delete updateData.classId;


    }



    Object.assign(

        arm,

        updateData

    );



    await arm.save();



    return arm;


};




// ============================================================
// BULK UPDATE CLASS ARMS
// Replace all arms for a school
// ============================================================

export const updateClassArms = async (

    schoolId,

    arms

) => {


    if(!isValidObjectId(schoolId)){

        throw new Error(
            "Invalid school ID."
        );

    }



    validateClassArms(
        arms
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




    const classIds =
        arms.map(
            arm => arm.classId
        ).filter(Boolean);



    const validClasses =

        await Class.find({

            _id:
                {
                    $in:classIds
                },

            school:
                schoolId

        });



    if(
        validClasses.length !==
        [...new Set(classIds.map(String))].length
    ){

        throw new Error(
            "Invalid class reference."
        );

    }





    await ClassArm.deleteMany({

        school:
            schoolId

    });






    const recreatedArms =


        await ClassArm.insertMany(


            arms.map(

                arm => ({


                    school:
                        schoolId,


                    class:
                        arm.classId || null,


                    name:
                        cleanString(
                            arm.name
                        ),



                    shortName:

                        arm.shortName ||

                        cleanString(
                            arm.name
                        )
                        .substring(0,3)
                        .toUpperCase(),



                    capacity:

                        arm.capacity ||

                        0,



                    description:

                        arm.description ||

                        "",



                    isActive:

                        true


                })

            )

        );





    return recreatedArms;


};




// ============================================================
// GET ALL CLASS ARMS
// ============================================================

export const getClassArms = async (

    schoolId

) => {


    if(!isValidObjectId(schoolId)){

        throw new Error(
            "Invalid school ID."
        );

    }



    return await ClassArm.find({

        school:
            schoolId,

        isActive:
            true

    })

    .populate(

        "class",

        "name shortName level"

    )

    .sort({

        name:
            1

    });


};




// ============================================================
// GET SINGLE CLASS ARM
// ============================================================

export const getClassArm = async (

    armId

) => {


    if(!isValidObjectId(armId)){

        throw new Error(
            "Invalid class arm ID."
        );

    }



    const arm =

        await ClassArm.findById(
            armId
        )
        .populate(

            "class",

            "name shortName level"

        );



    if(!arm){

        throw new Error(
            "Class arm not found."
        );

    }



    return arm;


};

// ============================================================
// DELETE CLASS ARM
// ============================================================

export const deleteClassArm = async (

    armId

) => {


    if(!isValidObjectId(armId)){

        throw new Error(
            "Invalid class arm ID."
        );

    }



    const arm =

        await ClassArm.findById(
            armId
        );



    if(!arm){

        throw new Error(
            "Class arm not found."
        );

    }



    await arm.deleteOne();



    return {


        success:
            true,


        message:
            "Class arm deleted successfully."

    };


};




// ============================================================
// CONTROLLER COMPATIBILITY WRAPPER
//
// Used by onboarding wizard
//
// ============================================================

export const setupClassArms = async (

    schoolId,

    arms

) => {


    return await createClassArms(

        schoolId,

        arms

    );


};




// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Onboarding compatibility
    */

    setupClassArms,



    /*
    CRUD
    */

    createClassArms,

    updateClassArm,

    updateClassArms,

    getClassArms,

    getClassArm,

    deleteClassArm


};