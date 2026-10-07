/*
==================================================
ROLE BASED ACCESS CONTROL MIDDLEWARE
==================================================
*/


export const roleMiddleware = (
  allowedRoles = []
) => {


  return (
    req,
    res,
    next
  ) => {


    try {


      /*
      ==========================================
      CHECK AUTHENTICATION
      ==========================================
      */


      if(!req.user){


        return res.status(401).json({

          success:false,

          message:
            "Authentication required"

        });


      }





      /*
      ==========================================
      ADMIN IMPERSONATION ACCESS
      ==========================================
      Admin can view teacher/parent portals
      ==========================================
      */


      if(

        req.user.role === "admin" &&
        req.isImpersonating === true

      ){

        return next();

      }








      /*
      ==========================================
      CHECK ROLE
      ==========================================
      */


      if(
        !allowedRoles.includes(
          req.user.role
        )
      ){


        return res.status(403).json({

          success:false,

          message:
            "You do not have permission to access this resource"

        });


      }






      next();



    }
    catch(error){



      console.error(
        "ROLE MIDDLEWARE ERROR:",
        error.message
      );



      return res.status(500).json({

        success:false,

        message:
          "Role authorization failed"

      });



    }


  };


};








/*
==================================================
SHORTCUT ROLE GUARDS
==================================================
*/


export const adminOnly =
roleMiddleware([
  "admin"
]);



export const teacherOnly =
roleMiddleware([
  "teacher"
]);



export const parentOnly =
roleMiddleware([
  "parent"
]);



export const staffOnly =
roleMiddleware([
  "admin",
  "teacher"
]);



export const managementOnly =
roleMiddleware([
  "admin",
  "principal",
  "vice_principal"
]);