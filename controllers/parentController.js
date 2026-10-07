import bcrypt from "bcryptjs";
import Parent from "../models/Parent.js";
import User from "../models/User.js";
import Student from "../models/Student.js";


/*
==================================================
CREATE PARENT
==================================================
*/

export const createParent = async (req, res) => {
  try {

    const school =
      req.school || req.school?._id;


    const {
      fullName,
      email,
      phone,
      password,
      children = [],
    } = req.body;


    /*
    ==========================================
    CHECK DUPLICATE EMAIL
    ==========================================
    */

    const existingUser =
      await User.findOne({
        school,
        email,
      });


    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Email already exists in this school.",
      });
    }



    /*
    ==========================================
    CREATE USER LOGIN ACCOUNT
    ==========================================
    
    Parent login is separate from
    admin impersonation.

    Admin does not need parent password
    because impersonation uses JWT.
    ==========================================
    */


    const user =
      await User.create({

        school,

        fullName,

        email,

        phone,

        password,

        role: "parent",

        status: "active",

      });



    /*
    ==========================================
    CREATE PARENT PROFILE
    ==========================================
    */


    const parent =
      await Parent.create({

        school,

        userId: user._id,

        fullName,

        email,

        phone,

        children,

        password,

      });



    /*
    ==========================================
    SYNC STUDENT LINKS
    ==========================================
    */

    if(children.length){

      await Student.updateMany(

        {
          _id:{
            $in: children
          },
          school,
        },

        {
          parent:
          parent._id
        }

      );

    }



    const populatedParent =
      await Parent.findById(parent._id)
      .populate(
        "children",
        `
        firstName
        lastName
        admissionNumber
        passport
        classId
        status
        `
      );



    return res.status(201).json({

      success:true,

      message:
      "Parent created successfully.",

      data:populatedParent,

    });



  } catch(error){


    console.error(
      "CREATE PARENT ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:error.message,

    });

  }
};






/*
==================================================
GET ALL PARENTS
==================================================
*/

export const getParents = async(req,res)=>{

  try{


    const school =
      req.school || req.school?._id;



    const {
      search="",
      page=1,
      limit=10,
      status="",
    } = req.query;



    const query={
      school,
    };



    /*
    ==========================================
    SEARCH
    ==========================================
    */

    if(search){

      query.$or=[

        {
          fullName:{
            $regex:search,
            $options:"i",
          },
        },


        {
          email:{
            $regex:search,
            $options:"i",
          },
        },


        {
          phone:{
            $regex:search,
            $options:"i",
          },
        },

      ];

    }



    if(status){

      query.status=status;

    }



    /*
    ==========================================
    PAGINATION
    ==========================================
    */


    const currentPage =
      Number(page);


    const pageSize =
      Number(limit);



    const skip =
      (currentPage - 1) *
      pageSize;



    const parents =
      await Parent.find(query)

      .populate(
        "children",
        `
        firstName
        lastName
        admissionNumber
        passport
        classId
        status
        `
      )

      .sort({
        createdAt:-1,
      })

      .skip(skip)

      .limit(pageSize);



    const total =
      await Parent.countDocuments(query);



    return res.json({

      success:true,

      count:parents.length,

      pagination:{

        total,

        page:currentPage,

        limit:pageSize,

        pages:
        Math.ceil(
          total/pageSize
        ),

      },


      data:parents,

    });



  }catch(error){


    console.error(
      "GET PARENTS ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:error.message,

    });

  }

};





/*
==================================================
PART 2 CONTINUES:

- getParent()
- updateParent()

==================================================
*/

/*
==================================================
GET SINGLE PARENT
==================================================
*/

export const getParent = async (req, res) => {
  try {

    const school =
      req.school || req.school?._id;


    const parent =
      await Parent.findOne({

        _id:req.params.id,

        school,

      })

      .populate(
        "children",
        `
        firstName
        middleName
        lastName
        admissionNumber
        passport
        classId
        sectionId
        status
        feeStatus
        `
      );



    if(!parent){

      return res.status(404).json({

        success:false,

        message:
        "Parent not found.",

      });

    }



    return res.json({

      success:true,

      data:parent,

    });



  }catch(error){


    console.error(
      "GET PARENT ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:error.message,

    });

  }
};






/*
==================================================
UPDATE PARENT
==================================================
*/

export const updateParent = async(req,res)=>{

  try{


    const school =
      req.school || req.school?._id;



    const parent =
      await Parent.findOne({

        _id:req.params.id,

        school,

      });



    if(!parent){

      return res.status(404).json({

        success:false,

        message:
        "Parent not found.",

      });

    }



    const {

      fullName,

      phone,

      email,

      children,

      password,

    } = req.body;



    const oldChildren =
      parent.children.map(
        child =>
        child.toString()
      );



    /*
    ==========================================
    UPDATE BASIC INFORMATION
    ==========================================
    */


    parent.fullName =
      fullName ?? parent.fullName;


    parent.phone =
      phone ?? parent.phone;


    parent.email =
      email ?? parent.email;



    if(children){

      parent.children =
        children;

    }



    /*
    ==========================================
    PASSWORD UPDATE
    ==========================================
    
    Parent login password can change,
    but admin impersonation does not
    depend on this.
    ==========================================
    */


    if(password){

      parent.password =
        password;

    }



    await parent.save();




    /*
    ==========================================
    SYNC STUDENT RELATIONSHIP
    ==========================================
    */


    const newChildren =
      children || oldChildren;



    /*
    Remove old parent link
    */


    const removedChildren =
      oldChildren.filter(

        id =>
        !newChildren.includes(id)

      );



    if(removedChildren.length){


      await Student.updateMany(

        {

          _id:{
            $in:
            removedChildren
          },

          school,

        },

        {

          $unset:{
            parent:""
          }

        }

      );

    }




    /*
    Add new parent link
    */


    const addedChildren =
      newChildren.filter(

        id =>
        !oldChildren.includes(id)

      );



    if(addedChildren.length){


      await Student.updateMany(

        {

          _id:{
            $in:
            addedChildren
          },

          school,

        },

        {

          parent:
          parent._id

        }

      );

    }





    /*
    ==========================================
    UPDATE USER ACCOUNT
    ==========================================
    */


    if(parent.userId){

      await User.findOneAndUpdate(

        {

          _id:
          parent.userId,

          school,

        },

        {

          fullName:
          parent.fullName,

          phone:
          parent.phone,

          email:
          parent.email,

        }

      );

    }




    const updatedParent =
      await Parent.findById(parent._id)

      .populate(

        "children",

        `
        firstName
        middleName
        lastName
        admissionNumber
        passport
        classId
        status
        `

      );




    return res.json({

      success:true,

      message:
      "Parent updated successfully.",

      data:
      updatedParent,

    });



  }catch(error){


    console.error(
      "UPDATE PARENT ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:error.message,

    });

  }

};





/*
==================================================
PART 3 CONTINUES:

- deleteParent()
- getParentStats()

==================================================
*/
/*
==================================================
DELETE PARENT
==================================================
*/

export const deleteParent = async (req, res) => {

  try {


    const school =
      req.school || req.school?._id;



    const parent =
      await Parent.findOne({

        _id:req.params.id,

        school,

      });



    if(!parent){

      return res.status(404).json({

        success:false,

        message:
        "Parent not found.",

      });

    }



    /*
    ==========================================
    REMOVE PARENT FROM CHILDREN
    ==========================================
    */


    if(parent.children.length){


      await Student.updateMany(

        {

          _id:{
            $in:
            parent.children
          },

          school,

        },

        {

          $unset:{
            parent:""
          }

        }

      );

    }




    /*
    ==========================================
    DELETE LOGIN ACCOUNT
    ==========================================
    */


    if(parent.userId){

      await User.findOneAndDelete({

        _id:
        parent.userId,

        school,

      });

    }




    /*
    ==========================================
    DELETE PARENT PROFILE
    ==========================================
    */


    await Parent.findByIdAndDelete(
      parent._id
    );



    return res.json({

      success:true,

      message:
      "Parent deleted successfully.",

    });



  }catch(error){


    console.error(
      "DELETE PARENT ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:error.message,

    });

  }

};








/*
==================================================
PARENT STATISTICS
==================================================
*/

export const getParentStats = async(req,res)=>{

  try{


    const school =
      req.school || req.school?._id;



    const [

      totalParents,

      activeParents,

      inactiveParents,

      parentsWithChildren,

      totalLinkedChildren

    ] = await Promise.all([



      Parent.countDocuments({

        school,

      }),



      Parent.countDocuments({

        school,

        status:"active",

      }),



      Parent.countDocuments({

        school,

        status:"inactive",

      }),



      Parent.countDocuments({

        school,

        children:{
          $exists:true,
          $not:{
            $size:0
          }
        },

      }),



      Student.countDocuments({

        school,

        parent:{
          $ne:null
        }

      }),


    ]);





    return res.json({

      success:true,


      data:{


        totalParents,


        activeParents,


        inactiveParents,


        parentsWithChildren,


        totalLinkedChildren,


      }


    });



  }catch(error){


    console.error(
      "PARENT STATS ERROR:",
      error
    );


    return res.status(500).json({

      success:false,

      message:error.message,

    });


  }

};