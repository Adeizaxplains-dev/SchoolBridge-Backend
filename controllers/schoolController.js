// ============================================================
// backend/controllers/schoolController.js
// SchoolBridge Enterprise School Controller
// ============================================================


import School from "../models/School.js";





/*
============================================================
GET SCHOOL PROFILE

GET /api/schools


Returns:

{
 success:true,
 school:{}
}

============================================================
*/


export const getSchoolProfile = async (
  req,
  res
)=>{


try{


const school =
await School.findById(
  req.school._id
);



if(!school){


return res.status(404).json({

success:false,

message:"School not found."

});


}



return res.status(200).json({

success:true,

data:school,

});


}
catch(error){


console.error(
"GET SCHOOL PROFILE ERROR:",
error
);



return res.status(500).json({

success:false,

message:
"Unable to load school profile."

});


}


};









/*
============================================================
UPDATE SCHOOL PROFILE

PUT /api/schools


Admin only


============================================================
*/


export const updateSchoolProfile = async (req, res) => {
  try {
    // Update the school profile
    let school = await School.findByIdAndUpdate(
      req.school._id,
      {
        ...req.body,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found.",
      });
    }

    // -----------------------------
    // Update onboarding status
    // -----------------------------
    school.setup.schoolProfile = true;

    school.lastSetupStep = "schoolProfile";

    // Move to the next onboarding step
    if (!school.setup.academicSession) {
      school.currentSetupStep = "academicSession";
    }

    // Calculate onboarding progress
    const totalSteps = Object.keys(school.setup).length;

    const completedSteps = Object.values(school.setup).filter(Boolean).length;

    school.onboardingPercentage = Math.round(
      (completedSteps / totalSteps) * 100
    );

    school.setupProgress = school.onboardingPercentage;

    school.setupCompleted = completedSteps === totalSteps;

    if (school.setupCompleted) {
      school.setupCompletedAt = new Date();
      school.onboardingCompleted = true;
    }

    // Save onboarding changes
    await school.save();

    return res.status(200).json({
      success: true,
      message: "School profile updated successfully.",
      data: school,
    });
  } catch (error) {
    console.error("UPDATE SCHOOL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update school profile.",
    });
  }
};









/*
============================================================
UPLOAD SCHOOL LOGO


POST /api/schools/logo


Middleware:

upload.single("logo")


Cloudinary returns:

req.file.path


============================================================
*/


export const uploadSchoolLogo = async (req, res) => {

  try {

    console.log("========== LOGO UPLOAD START ==========");

    console.log("FILE:", req.file);

    console.log("SCHOOL:", req.school);

    if (!req.file) {

      return res.status(400).json({

        success:false,

        message:"No logo file received"

      });

    }


    const logoUrl = req.file.path;


    console.log(
      "CLOUDINARY URL:",
      logoUrl
    );


    const school =
      await School.findByIdAndUpdate(

        req.school._id,

        {
          logo: logoUrl
        },

        {
          new:true
        }

      );


    console.log(
      "UPDATED SCHOOL:",
      school
    );


    return res.status(200).json({

      success:true,

      message:"Logo uploaded successfully",

      school

    });


  } catch(error) {


    console.error(
      "========== LOGO UPLOAD FAILED =========="
    );

    console.error(error);


    return res.status(500).json({

      success:false,

      message:error.message

    });


  }

};



/*
============================================================
GET SCHOOL STATISTICS


GET /api/schools/stats


============================================================
*/


export const getSchoolStats = async (
req,
res
)=>{


try{


const school =
await School.findById(
req.school._id
);





if(!school){


return res.status(404).json({

success:false,

message:
"School not found."

});


}





return res.status(200).json({

success:true,


statistics:{

students:
school.statistics?.students || 0,


teachers:
school.statistics?.teachers || 0,


parents:
school.statistics?.parents || 0,


classes:
school.statistics?.classes || 0,


},



subscription:{


plan:
school.subscriptionPlan || "Trial",


status:
school.subscriptionStatus || "active",


trialEndsAt:
school.trialEndsAt,


studentLimit:
school.studentLimit,


teacherLimit:
school.teacherLimit,


parentLimit:
school.parentLimit,


}



});


}
catch(error){


console.error(
"SCHOOL STATS ERROR:",
error
);



return res.status(500).json({

success:false,

message:
"Unable to load school statistics."

});


}


};