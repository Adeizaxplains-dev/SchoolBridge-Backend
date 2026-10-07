// ============================================================
// completionService.js
// SchoolBridge Enterprise Onboarding Completion Service
// ============================================================


import mongoose from "mongoose";


// ============================================================
// MODELS
// ============================================================

import School from "../../models/School.js";
import Onboarding from "../../models/Onboarding.js";



// ============================================================
// SERVICES
// ============================================================

import progressService from "./progressService.js";



// ============================================================
// CONSTANTS
// ============================================================


const REQUIRED_STEPS = [

    "school_profile",

    "academic_session",

    "terms",

    "classes",

    "subjects",

    "fee_structure",

    "grading_system"

];





// ============================================================
// CHECK REQUIRED STEPS
// ============================================================


const checkRequiredSteps = (
    completedSteps = []
)=>{


    return REQUIRED_STEPS.filter(

        step =>

        !completedSteps.includes(step)

    );


};







// ============================================================
// COMPLETE ONBOARDING
// ============================================================


export const completeOnboarding = async (

    school

)=>{


    const session =
        await mongoose.startSession();



    try{


        session.startTransaction();



        /*
        ============================================
        FIND ONBOARDING
        ============================================
        */


        const onboarding =

            await Onboarding.findOne({

                school:school

            })
            .session(session);





        if(!onboarding){


            throw new Error(

                "Onboarding record not found"

            );


        }






        /*
        ============================================
        CHECK COMPLETION
        ============================================
        */


        const missingSteps =

            checkRequiredSteps(

                onboarding.completedSteps

            );




        if(missingSteps.length){


            throw new Error(

                `Incomplete setup steps: ${missingSteps.join(", ")}`

            );


        }





        /*
        ============================================
        UPDATE ONBOARDING
        ============================================
        */


        onboarding.status =

            "completed";



        onboarding.currentStep =

            "completed";



        onboarding.completedAt =

            new Date();




        onboarding.progress =

            100;




        await onboarding.save({

            session

        });








        /*
        ============================================
        UPDATE SCHOOL
        ============================================
        */









        /*
        ============================================
        COMMIT
        ============================================
        */


        await session.commitTransaction();



        session.endSession();






        return {


            success:true,


            message:

            "School onboarding completed successfully",



            progress:100,



            status:"completed"



        };



    }

    catch(error){



        await session.abortTransaction();


        session.endSession();



        throw error;


    }



};







// ============================================================
// CHECK IF SCHOOL IS READY
// ============================================================


export const checkCompletionStatus = async (

    school

)=>{


    const onboarding =

        await Onboarding.findOne({

            school:school

        });




    if(!onboarding){


        return {


            completed:false,


            progress:0,


            missingSteps:
            REQUIRED_STEPS



        };


    }







    const missingSteps =

        checkRequiredSteps(

            onboarding.completedSteps

        );






    return {


        completed:
        missingSteps.length === 0,



        progress:
        onboarding.progress || 0,



        currentStep:
        onboarding.currentStep,



        missingSteps



    };



};






export default {


    completeOnboarding,


    checkCompletionStatus


};