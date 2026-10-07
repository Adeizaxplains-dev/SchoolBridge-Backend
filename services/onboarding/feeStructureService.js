// ============================================================
// backend/services/onboarding/feeStructureService.js
// SchoolBridge Enterprise
// Fee Structure Service
// ============================================================


import mongoose from "mongoose";

import FeeStructure from "../../models/FeeStructure.js";
import School from "../../models/School.js";
import AcademicSession from "../../models/AcademicSession.js";
import Term from "../../models/Term.js";
import Class from "../../models/Class.js";


import {
    ONBOARDING_STEPS
} from "./constants.js";


import {
    markStepCompleted
} from "./progressService.js";




// ============================================================
// VALIDATION
// ============================================================

const validateFeeStructures = (

    fees = []

)=>{


    if(

        !Array.isArray(fees)

        ||

        fees.length === 0

    ){

        throw new Error(
            "At least one fee structure is required."
        );

    }





    fees.forEach(

        (fee,index)=>{


            if(!fee.class){

                throw new Error(
                    `Fee ${index + 1} requires class.`
                );

            }




            if(!fee.term){

                throw new Error(
                    `Fee ${index + 1} requires term.`
                );

            }




            if(

                !Array.isArray(
                    fee.items
                )

                ||

                fee.items.length === 0

            ){

                throw new Error(
                    `Fee ${index + 1} requires fee items.`
                );

            }


        }

    );


};




// ============================================================
// VALIDATE OBJECT ID
// ============================================================

const validateId = (

    id,

    message

)=>{


    if(
        !mongoose.Types.ObjectId.isValid(id)
    ){

        throw new Error(message);

    }

};




// ============================================================
// CREATE FEE STRUCTURES
// ============================================================

export const createFeeStructures = async (

    schoolId,

    fees

)=>{


    validateId(

        schoolId,

        "Invalid school ID."

    );





    fees = Array.isArray(fees)

        ? fees

        : [fees];





    validateFeeStructures(

        fees

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





    const createdFees = [];





    for(const fee of fees){



        const session =

            await AcademicSession.findOne({

                _id:

                    fee.session,

                school:

                    schoolId

            });





        if(!session){

            throw new Error(
                "Academic session not found."
            );

        }






        const term =

            await Term.findOne({

                _id:

                    fee.term,

                school:

                    schoolId

            });





        if(!term){

            throw new Error(
                "Term not found."
            );

        }






        const classRecord =

            await Class.findOne({

                _id:

                    fee.class,

                school:

                    schoolId

            });





        if(!classRecord){

            throw new Error(
                "Class not found."
            );

        }







        const existing =

            await FeeStructure.findOne({

                school:

                    schoolId,

                session:

                    fee.session,

                term:

                    fee.term,

                class:

                    fee.class

            });





        if(existing){

            throw new Error(
                "Fee structure already exists for this class and term."
            );

        }







        const feeStructure =

            await FeeStructure.create({


                school:

                    schoolId,


                session:

                    fee.session,


                term:

                    fee.term,


                class:

                    fee.class,


                title:

                    fee.title ||

                    "School Fees",



                items:

                    fee.items,



                paymentDeadline:

                    fee.paymentDeadline || null,



                installmentAllowed:

                    fee.installmentAllowed ?? false,



                maximumInstallments:

                    fee.maximumInstallments || 1,



                isActive:

                    true


            });





        createdFees.push(
            feeStructure
        );


    }







    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.FEE_STRUCTURE

    );







    return createdFees;


};




// ============================================================
// CREATE DEFAULT FEE TEMPLATE
// ============================================================

export const createDefaultFeeTemplate = async (

    schoolId,

    sessionId,

    termId,

    classId

)=>{


    validateId(
        schoolId,
        "Invalid school ID."
    );




    const defaultItems = [


        {
            name:"Tuition Fee",
            amount:0,
            category:"tuition"
        },


        {
            name:"Development Levy",
            amount:0,
            category:"development"
        },


        {
            name:"Examination Fee",
            amount:0,
            category:"exam"
        },


        {
            name:"Books",
            amount:0,
            category:"books"
        },


        {
            name:"Uniform",
            amount:0,
            category:"uniform"
        }


    ];






    return await FeeStructure.create({


        school:

            schoolId,


        session:

            sessionId,


        term:

            termId,


        class:

            classId,


        title:

            "Default Fee Structure",



        items:

            defaultItems,



        isActive:

            true


    });


};

// ============================================================
// GET ALL FEE STRUCTURES
// ============================================================

export const getFeeStructures = async (

    schoolId

) => {


    validateId(

        schoolId,

        "Invalid school ID."

    );





    return await FeeStructure.find({

        school:

            schoolId,


        isActive:

            true


    })

    .populate(

        "class"

    )

    .populate(

        "term"

    )

    .populate(

        "session"

    )

    .sort({

        createdAt:

            -1

    });


};




// ============================================================
// GET SINGLE FEE STRUCTURE
// ============================================================

export const getFeeStructure = async (

    feeId

) => {


    validateId(

        feeId,

        "Invalid fee structure ID."

    );





    const feeStructure =

        await FeeStructure.findById(

            feeId

        )

        .populate(

            "class"

        )

        .populate(

            "term"

        )

        .populate(

            "session"

        );






    if(!feeStructure){


        throw new Error(

            "Fee structure not found."

        );

    }





    return feeStructure;


};




// ============================================================
// UPDATE FEE STRUCTURE
// ============================================================

export const updateFeeStructure = async (

    feeId,

    updateData

) => {


    validateId(

        feeId,

        "Invalid fee structure ID."

    );






    const feeStructure =

        await FeeStructure.findById(

            feeId

        );






    if(!feeStructure){


        throw new Error(

            "Fee structure not found."

        );

    }






    /*
    ==========================================
    UPDATE VALIDATION
    ==========================================
    */


    if(

        updateData.items &&

        !Array.isArray(
            updateData.items
        )

    ){

        throw new Error(

            "Fee items must be an array."

        );

    }






    if(updateData.maximumInstallments){


        if(

            updateData.maximumInstallments < 1

        ){

            throw new Error(

                "Maximum installments must be at least 1."

            );

        }


    }







    /*
    ==========================================
    UPDATE FIELDS
    ==========================================
    */


    if(updateData.title !== undefined){


        feeStructure.title =

            updateData.title;


    }





    if(updateData.items !== undefined){


        feeStructure.items =

            updateData.items;


    }





    if(updateData.paymentDeadline !== undefined){


        feeStructure.paymentDeadline =

            updateData.paymentDeadline;


    }





    if(updateData.installmentAllowed !== undefined){


        feeStructure.installmentAllowed =

            updateData.installmentAllowed;


    }





    if(updateData.maximumInstallments !== undefined){


        feeStructure.maximumInstallments =

            updateData.maximumInstallments;


    }





    if(updateData.isActive !== undefined){


        feeStructure.isActive =

            updateData.isActive;


    }







    await feeStructure.save();






    return feeStructure;


};

// ============================================================
// DELETE FEE STRUCTURE
// ============================================================

export const deleteFeeStructure = async (

    feeId

) => {


    validateId(

        feeId,

        "Invalid fee structure ID."

    );






    const feeStructure =

        await FeeStructure.findById(

            feeId

        );






    if(!feeStructure){


        throw new Error(

            "Fee structure not found."

        );

    }







    await feeStructure.deleteOne();







    return {


        success:

            true,



        message:

            "Fee structure deleted successfully."

    };


};




// ============================================================
// CONTROLLER COMPATIBILITY WRAPPER
//
// Used by onboarding wizard
//
// ============================================================

export const setupFeeStructure = async (

    schoolId,

    fees

) => {


    return await createFeeStructures(

        schoolId,

        fees

    );


};




// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Onboarding compatibility
    */

    setupFeeStructure,



    /*
    Create
    */

    createFeeStructures,

    createDefaultFeeTemplate,



    /*
    Read
    */

    getFeeStructures,

    getFeeStructure,



    /*
    Update
    */

    updateFeeStructure,



    /*
    Delete
    */

    deleteFeeStructure,


};