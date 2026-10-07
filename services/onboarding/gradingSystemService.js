// ============================================================
// backend/services/onboarding/gradingSystemService.js
// SchoolBridge Enterprise
// Grading System Configuration Service
// ============================================================


import mongoose from "mongoose";

import GradingSystem from "../../models/GradingSystem.js";


import {
    ONBOARDING_STEPS
} from "./constants.js";


import {
    markStepCompleted
} from "./progressService.js";




// ============================================================
// DEFAULT NIGERIAN GRADING SYSTEM
// ============================================================

const DEFAULT_GRADES = [

    {
        grade:"A",
        minScore:70,
        maxScore:100,
        point:5,
        remark:"Excellent"
    },


    {
        grade:"B",
        minScore:60,
        maxScore:69,
        point:4,
        remark:"Very Good"
    },


    {
        grade:"C",
        minScore:50,
        maxScore:59,
        point:3,
        remark:"Good"
    },


    {
        grade:"D",
        minScore:45,
        maxScore:49,
        point:2,
        remark:"Fair"
    },


    {
        grade:"E",
        minScore:40,
        maxScore:44,
        point:1,
        remark:"Pass"
    },


    {
        grade:"F",
        minScore:0,
        maxScore:39,
        point:0,
        remark:"Fail"
    }

];




// ============================================================
// VALIDATE ID
// ============================================================

const validateId = (

    id

)=>{


    if(

        !mongoose.Types.ObjectId.isValid(id)

    ){

        throw new Error(
            "Invalid school ID."
        );

    }

};




// ============================================================
// CREATE GRADING SYSTEM
// ============================================================

export const createGradingSystem = async (

    schoolOrOptions,

    payload = {}

)=>{


    let schoolId;

    let data;





    if(

        typeof schoolOrOptions === "object"

        &&

        schoolOrOptions !== null

        &&

        schoolOrOptions.school

    ){


        schoolId =

            schoolOrOptions.school;


        data =

            schoolOrOptions.data || {};



    }

    else{


        schoolId =

            schoolOrOptions;


        data =

            payload || {};


    }







    validateId(

        schoolId

    );







    const existing =

        await GradingSystem.findOne({

            school:

                schoolId

        });







    if(existing){


        return existing;


    }







    const grades =


        Array.isArray(data.grades)

        &&

        data.grades.length


            ?


            data.grades


            :


            DEFAULT_GRADES;







    const gradingSystem =

        await GradingSystem.create({



            school:

                schoolId,



            name:

                data.name ||

                "Default Nigerian Secondary School Grading System",



            description:

                data.description ||

                "Standard percentage grading system",



            passMark:

                data.passMark ?? 40,



            grades,



            isDefault:

                true,



            isActive:

                true



        });







    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.GRADING_SYSTEM

    );







    return gradingSystem;


};

// ============================================================
// GET GRADING SYSTEM
// ============================================================

export const getGradingSystem = async (

    schoolId

) => {


    validateId(

        schoolId

    );





    const gradingSystem =

        await GradingSystem.findOne({

            school:

                schoolId,

            isActive:

                true

        });






    if(!gradingSystem){


        throw new Error(

            "Grading system not found."

        );

    }







    return gradingSystem;


};




// ============================================================
// UPDATE GRADING SYSTEM
//
// Supports:
//
// updateGradingSystem(schoolId,data)
//
// updateGradingSystem({
//    school,
//    data
// })
//
// ============================================================

export const updateGradingSystem = async (

    schoolOrOptions,

    payload = {}

) => {


    let schoolId;

    let data;





    if(

        typeof schoolOrOptions === "object"

        &&

        schoolOrOptions !== null

        &&

        schoolOrOptions.school

    ){


        schoolId =

            schoolOrOptions.school;


        data =

            schoolOrOptions.data || {};



    }

    else{


        schoolId =

            schoolOrOptions;


        data =

            payload || {};


    }






    validateId(

        schoolId

    );







    const gradingSystem =

        await GradingSystem.findOne({

            school:

                schoolId

        });







    if(!gradingSystem){


        throw new Error(

            "Grading system not found."

        );

    }








    /*
    ==========================================
    VALIDATE GRADES
    ==========================================
    */


    if(data.grades){


        if(

            !Array.isArray(

                data.grades

            )

        ){


            throw new Error(

                "Grades must be an array."

            );

        }



    }









    /*
    ==========================================
    UPDATE FIELDS
    ==========================================
    */


    if(data.name !== undefined){


        gradingSystem.name =

            data.name;


    }





    if(data.description !== undefined){


        gradingSystem.description =

            data.description;


    }





    if(data.passMark !== undefined){


        gradingSystem.passMark =

            data.passMark;


    }





    if(data.grades !== undefined){


        gradingSystem.grades =

            data.grades;


    }





    if(data.isActive !== undefined){


        gradingSystem.isActive =

            data.isActive;


    }





    if(data.isDefault !== undefined){


        gradingSystem.isDefault =

            data.isDefault;


    }








    await gradingSystem.save();








    return gradingSystem;


};

// ============================================================
// DELETE GRADING SYSTEM
// ============================================================

export const deleteGradingSystem = async (

    schoolId

) => {


    validateId(

        schoolId

    );







    const gradingSystem =

        await GradingSystem.findOne({

            school:

                schoolId

        });







    if(!gradingSystem){


        throw new Error(

            "Grading system not found."

        );

    }







    await gradingSystem.deleteOne();







    return {


        success:

            true,



        message:

            "Grading system deleted successfully."

    };


};




// ============================================================
// ONBOARDING COMPATIBILITY WRAPPER
//
// Used by onboarding wizard
//
// ============================================================

export const setupGradingSystem = async (

    schoolId,

    data = {}

) => {


    return await createGradingSystem(

        schoolId,

        data

    );


};




// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Onboarding
    */

    setupGradingSystem,



    /*
    CRUD
    */

    createGradingSystem,

    getGradingSystem,

    updateGradingSystem,

    deleteGradingSystem


};