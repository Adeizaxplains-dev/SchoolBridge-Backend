/*
==================================================
ROLE GUARD MIDDLEWARE
==================================================
Purpose:
Control access based on user roles
==================================================
*/


export const roleGuard =
(...allowedRoles) => {


  return (
    req,
    res,
    next
  ) => {


    try {


      /*
      ==========================================
      CHECK USER AUTHENTICATION
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
      ADMIN IMPERSONATION
      ==========================================
      Allow admin to view other portals
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
      ROLE CHECK
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
            "You are not authorized to access this resource"

        });


      }






      next();



    }
    catch(error){


      console.error(
        "ROLE GUARD ERROR:",
        error.message
      );



      return res.status(500).json({

        success:false,

        message:
          "Authorization failed"

      });



    }


  };


};