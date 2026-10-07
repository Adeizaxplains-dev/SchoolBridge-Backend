// ============================================================
// backend/services/onboarding/departmentService.js
// SchoolBridge Enterprise
// Department Service
// ============================================================


import Department from "../../models/Department.js";

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
// GENERATE DEPARTMENT CODE
// ============================================================

const generateDepartmentCode = (

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

const validateDepartments = (

    departments = []

) => {


    if(

        !Array.isArray(departments)

        ||

        departments.length === 0

    ){

        throw new Error(

            "At least one department is required."

        );

    }





    departments.forEach(

        (department,index)=>{


            if(!department.name){


                throw new Error(

                    `Department ${index + 1} name is required.`

                );

            }


        }

    );


};




// ============================================================
// DUPLICATE CHECK
// ============================================================

const checkDuplicateDepartments = async (

    schoolId,

    departments

)=>{


    const names =

        departments.map(

            department =>

            cleanString(
                department.name
            )
            .toLowerCase()

        );





    const existing =

        await Department.find({

            school:

                schoolId,


            name:

            {

                $in:names

            }


        });





    if(existing.length){


        throw new Error(

            "Some departments already exist."

        );


    }


};




// ============================================================
// CREATE DEPARTMENTS
// ============================================================

export const createDepartments = async (

    schoolId,

    departments

)=>{


    if(!isValidObjectId(schoolId)){


        throw new Error(

            "Invalid school ID."

        );

    }





    validateDepartments(

        departments

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






    await checkDuplicateDepartments(

        schoolId,

        departments

    );







    const formattedDepartments =


        departments.map(

            (department,index)=>({



                school:

                    schoolId,



                name:

                    cleanString(
                        department.name
                    ),



                code:

                    department.code ||

                    generateDepartmentCode(
                        department.name
                    ),



                description:

                    department.description ||

                    "",



                head:

                    department.head ||

                    null,



                order:

                    index + 1,



                isActive:

                    true



            })

        );







    const createdDepartments =


        await Department.insertMany(

            formattedDepartments

        );







    await markStepCompleted(

        schoolId,

        ONBOARDING_STEPS.DEPARTMENTS

    );







    return createdDepartments;


};

// ============================================================
// UPDATE SINGLE DEPARTMENT
// ============================================================

export const updateDepartment = async (

    departmentId,

    updateData

) => {


    if(!isValidObjectId(departmentId)){


        throw new Error(

            "Invalid department ID."

        );

    }




    const department =

        await Department.findById(

            departmentId

        );





    if(!department){


        throw new Error(

            "Department not found."

        );

    }





    /*
    ---------------------------------------------
    Normalize values
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

            generateDepartmentCode(

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

        department,

        updateData

    );





    await department.save();





    return department;


};




// ============================================================
// BULK UPDATE DEPARTMENTS
// Replace all departments for a school
// ============================================================

export const updateDepartments = async (

    schoolId,

    departments

) => {


    if(!isValidObjectId(schoolId)){


        throw new Error(

            "Invalid school ID."

        );

    }





    validateDepartments(

        departments

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







    await Department.deleteMany({

        school:

            schoolId

    });







    const recreatedDepartments =


        await Department.insertMany(


            departments.map(

                (department,index)=>({



                    school:

                        schoolId,



                    name:

                        cleanString(

                            department.name

                        ),



                    code:

                        department.code ||

                        generateDepartmentCode(

                            department.name

                        ),



                    description:

                        department.description ||

                        "",



                    head:

                        department.head ||

                        null,



                    order:

                        index + 1,



                    isActive:

                        true



                })

            )

        );







    return recreatedDepartments;


};




// ============================================================
// GET ALL DEPARTMENTS
// ============================================================

export const getDepartments = async (

    schoolId

) => {


    if(!isValidObjectId(schoolId)){


        throw new Error(

            "Invalid school ID."

        );

    }




    return await Department.find({

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
// GET SINGLE DEPARTMENT
// ============================================================

export const getDepartment = async (

    departmentId

) => {


    if(!isValidObjectId(departmentId)){


        throw new Error(

            "Invalid department ID."

        );

    }





    const department =

        await Department.findById(

            departmentId

        );





    if(!department){


        throw new Error(

            "Department not found."

        );

    }





    return department;


};

// ============================================================
// DELETE DEPARTMENT
// ============================================================

export const deleteDepartment = async (

    departmentId

) => {


    if(!isValidObjectId(departmentId)){


        throw new Error(

            "Invalid department ID."

        );

    }




    const department =

        await Department.findById(

            departmentId

        );





    if(!department){


        throw new Error(

            "Department not found."

        );

    }





    await department.deleteOne();






    return {


        success:

            true,



        message:

            "Department deleted successfully."

    };


};




// ============================================================
// CONTROLLER COMPATIBILITY WRAPPER
//
// Used by onboarding wizard
//
// ============================================================

export const setupDepartments = async (
    schoolId,
    departments,
    options = {}
) => {

    const {
        userId = null,
        mongoSession = null
    } = options;

    if (!isValidObjectId(schoolId)) {

        throw new Error(
            "Invalid school ID."
        );

    }

    validateDepartments(
        departments
    );

    const schoolDoc =
        await School.findById(
            schoolId
        ).session(
            mongoSession
        );

    if (!schoolDoc) {

        throw new Error(
            "School not found."
        );

    }

    await checkDuplicateDepartments(
        schoolId,
        departments
    );

    const formattedDepartments =
        departments.map(
            (department, index) => ({

                school:
                    schoolId,

                name:
                    cleanString(
                        department.name
                    ),

                code:
                    department.code ||
                    generateDepartmentCode(
                        department.name
                    ),

                description:
                    department.description ||
                    "",

                head:
                    department.head ||
                    null,

                order:
                    index + 1,

                isActive:
                    true

            })
        );

    const createdDepartments =
        await Department.insertMany(
            formattedDepartments,
            {
                session: mongoSession
            }
        );

    /*
    ---------------------------------------------
    Mark onboarding step complete
    ---------------------------------------------
    */

    const onboarding =
        await markStepCompleted(
            schoolId,
            ONBOARDING_STEPS.DEPARTMENTS,
            mongoSession
        );

    return {

        departments:
            createdDepartments,

        onboarding

    };

};




// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {


    /*
    Onboarding compatibility
    */

    setupDepartments,



    /*
    CRUD
    */

    createDepartments,

    updateDepartment,

    updateDepartments,

    getDepartments,

    getDepartment,

    deleteDepartment


};