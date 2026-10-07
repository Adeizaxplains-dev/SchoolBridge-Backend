// ============================================================
// backend/middleware/tenantMiddleware.js
// SchoolBridge Enterprise Multi Tenant Middleware
// ============================================================


import mongoose from "mongoose";

import School from "../models/School.js";




// ============================================================
// RESOLVE SCHOOL ID
// ============================================================

const resolveSchoolId = (req)=>{


    /*
    ==============================================
    AUTH CONTEXT FIRST
    ==============================================
    */


    if(
        req.school?._id
    ){

        return req.school._id;

    }



    if(
        req.school
    ){

        return req.school;

    }




    if(
        req.user?.school?._id
    ){

        return req.user.school._id;

    }



    if(
        req.user?.school
    ){

        return req.user.school;

    }



    /*
    ==============================================
    FALLBACK ONLY
    ==============================================

    Used for:
    - public integrations
    - future API keys

    NOT trusted for normal users.

    ==============================================
    */


    if(
        req.headers["x-school-id"]
    ){

        return req.headers["x-school-id"];

    }



    return null;


};






// ============================================================
// TENANT MIDDLEWARE
// ============================================================


export const tenantMiddleware = async(
    req,
    res,
    next
)=>{


try{


const schoolId =
resolveSchoolId(req);




console.log(
"TENANT RESOLVE:",
schoolId
);





if(
!schoolId
){


return res.status(401).json({

success:false,

message:
"School context missing."

});


}






// ============================================================
// VALIDATE OBJECT ID
// ============================================================


if(
!mongoose.Types.ObjectId.isValid(
schoolId
)
){


return res.status(400).json({

success:false,

message:
"Invalid school identifier."

});


}





// ============================================================
// USE EXISTING SCHOOL CONTEXT
// ============================================================


let school =
req.school;





if(
!school ||
!school._id
){


school =
await School.findById(
schoolId
);


}






if(
!school
){


return res.status(404).json({

success:false,

message:
"School not found."

});


}







// ============================================================
// CHECK SCHOOL STATUS
// ============================================================


if(
school.isActive === false
){


return res.status(403).json({

success:false,

message:
"School account is inactive."

});


}






// ============================================================
// TENANT OWNERSHIP VALIDATION
// ============================================================


if(
req.user?.school
&&
school._id.toString()
!==
req.user.school.toString()
){


return res.status(403).json({

success:false,

message:
"Unauthorized school access."

});


}






// ============================================================
// ATTACH TENANT CONTEXT
// ============================================================


req.school =
school;


req.schoolId =
school._id;





console.log(
"TENANT ACTIVE:",
school.name
);





next();



}

catch(error){


console.error(
"TENANT MIDDLEWARE ERROR:",
error
);



return res.status(500).json({

success:false,

message:
"Tenant verification failed."

});


}



};






// ============================================================
// SUBSCRIPTION CHECK
// ============================================================


export const requireActiveSubscription =
(
req,
res,
next
)=>{


try{


if(
!req.school
){


return res.status(403).json({

success:false,

message:
"School context required."

});


}




const allowedStatuses = [

"trial",

"active"

];





if(
!allowedStatuses.includes(
req.school.subscriptionStatus
)

){


return res.status(403).json({

success:false,

message:
"Subscription inactive.",

redirect:
"/admin/billing"

});


}




next();


}

catch(error){


return res.status(500).json({

success:false,

message:
"Subscription validation failed."

});


}


};






// ============================================================
// EXPORT DEFAULT
// ============================================================


export default tenantMiddleware;