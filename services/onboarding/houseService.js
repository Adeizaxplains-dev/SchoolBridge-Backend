// ============================================================
// backend/services/onboarding/houseService.js
// SchoolBridge Enterprise
// House Service
// ============================================================


import House from "../../models/House.js";

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
// GENERATE HOUSE CODE
// ============================================================

const generateHouseCode = (

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

const validateHouses = (

    houses = []

) => {


    if(

        !Array.isArray(houses)

        ||

        houses.length === 0

    ){

        throw new Error(

            "At least one house is required."

        );

    }





    houses.forEach(

        (house,index)=>{


            if(!house.name){


                throw new Error(

                    `House ${index + 1} name is required.`

                );

            }


        }

    );


};




// ============================================================
// DUPLICATE CHECK
// ============================================================

const checkDuplicateHouses = async (

    schoolId,

    houses

)=>{


    const names =

        houses.map(

            house =>

            cleanString(
                house.name
            )
            .toLowerCase()

        );





    const existing =

        await House.find({

            school:

                schoolId,


            name:

            {

                $in:names

            }


        });






    if(existing.length){


        throw new Error(

            "Some houses already exist."

        );


    }


};




// ============================================================
// CREATE HOUSES
// ============================================================

export const createHouses = async (

    schoolId,

    houses

)=>{


    if(!isValidObjectId(schoolId)){


        throw new Error(

            "Invalid school ID."

        );

    }





    validateHouses(

        houses

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






    await checkDuplicateHouses(

        schoolId,

        houses

    );







    const formattedHouses =


        houses.map(

            (house,index)=>({



                school:

                    schoolId,



                name:

                    cleanString(

                        house.name

                    ),



                code:

                    house.code ||

                    generateHouseCode(

                        house.name

                    ),



                color:

                    house.color ||

                    "",



                description:

                    house.description ||

                    "",



                houseMaster:

                    house.houseMaster ||

                    null,



                order:

                    index + 1,



                isActive:

                    true



            })

        );







    const createdHouses =


        await House.insertMany(

            formattedHouses

        );







    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.HOUSES

    );







    return createdHouses;


};

// ============================================================
// UPDATE SINGLE HOUSE
// ============================================================

export const updateHouse = async (

    houseId,

    updateData

) => {


    if(!isValidObjectId(houseId)){


        throw new Error(

            "Invalid house ID."

        );

    }




    const house =

        await House.findById(

            houseId

        );





    if(!house){


        throw new Error(

            "House not found."

        );

    }





    /*
    ---------------------------------------------
    Normalize fields
    ---------------------------------------------
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

            generateHouseCode(

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

        house,

        updateData

    );





    await house.save();





    return house;


};




// ============================================================
// BULK UPDATE HOUSES
// Replace all houses for a school
// ============================================================

export const updateHouses = async (

    schoolId,

    houses

) => {


    if(!isValidObjectId(schoolId)){


        throw new Error(

            "Invalid school ID."

        );

    }





    validateHouses(

        houses

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







    await House.deleteMany({

        school:

            schoolId

    });







    const recreatedHouses =


        await House.insertMany(


            houses.map(

                (house,index)=>({



                    school:

                        schoolId,



                    name:

                        cleanString(

                            house.name

                        ),



                    code:

                        house.code ||

                        generateHouseCode(

                            house.name

                        ),



                    color:

                        house.color ||

                        "",



                    description:

                        house.description ||

                        "",



                    houseMaster:

                        house.houseMaster ||

                        null,



                    order:

                        index + 1,



                    isActive:

                        true



                })

            )

        );







    return recreatedHouses;


};




// ============================================================
// GET ALL HOUSES
// ============================================================

export const getHouses = async (

    schoolId

) => {


    if(!isValidObjectId(schoolId)){


        throw new Error(

            "Invalid school ID."

        );

    }





    return await House.find({

        school:

            schoolId,


        isDeleted: { $ne: true }


    })

    .sort({

        order:

            1

    });


};




// ============================================================
// GET SINGLE HOUSE
// ============================================================

export const getHouse = async (

    houseId

) => {


    if(!isValidObjectId(houseId)){


        throw new Error(

            "Invalid house ID."

        );

    }





    const house =

        await House.findById(

            houseId

        );





    if(!house){


        throw new Error(

            "House not found."

        );

    }





    return house;


};

// ============================================================
// DELETE HOUSE
// ============================================================

export const deleteHouse = async (

    houseId

) => {


    if(!isValidObjectId(houseId)){


        throw new Error(

            "Invalid house ID."

        );

    }





    const house =

        await House.findById(

            houseId

        );





    if(!house){


        throw new Error(

            "House not found."

        );

    }





    await house.deleteOne();






    return {


        success:

            true,



        message:

            "House deleted successfully."

    };


};




// ============================================================
// CONTROLLER COMPATIBILITY WRAPPER
//
// Used by onboarding wizard
//
// ============================================================

export const setupHouses = async (

    schoolId,

    houses

) => {


    return await createHouses(

        schoolId,

        houses

    );


};




// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Onboarding compatibility
    */

    setupHouses,



    /*
    CRUD
    */

    createHouses,

    updateHouse,

    updateHouses,

    getHouses,

    getHouse,

    deleteHouse


};