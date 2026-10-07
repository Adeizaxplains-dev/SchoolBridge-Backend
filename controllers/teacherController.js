import Teacher from "../models/Teacher.js";
import User from "../models/User.js";

/*
==================================================
CREATE TEACHER
==================================================
*/

export const createTeacher = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    /*
    ==========================================
    GET FORM DATA
    ==========================================
    */

    const {
      firstName,
      lastName,
      fullName,

      email,
      phone,

      password,

      gender,
      dateOfBirth,

      employeeId,
      staffId,

      department,
      designation,

      qualification,
      experience,

      address,

      subjects,
      classTeacherOf,
      employmentDate,
    } = req.body;

    /*
    ==========================================
    BUILD FULL NAME
    ==========================================
    */

    const teacherName =
      fullName ||
      `${firstName || ""} ${lastName || ""}`.trim();

    /*
    ==========================================
    DEFAULT PASSWORD
    ==========================================
    */

    const teacherPassword =
      password || "123456";

    /*
    ==========================================
    STAFF ID
    ==========================================
    */

    const teacherStaffId =
      staffId || employeeId || "";

    /*
    ==========================================
    VALIDATION
    ==========================================
    */

    if (!teacherName || !email) {
      return res.status(400).json({
        success: false,
        message: "Teacher name and email are required.",
      });
    }

    /*
    ==========================================
    CHECK EXISTING TEACHER
    ==========================================
    */

    const existingTeacher = await Teacher.findOne({
      school,
      email: email.toLowerCase(),
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Teacher already exists.",
      });
    }

    /*
    ==========================================
    CHECK STAFF ID
    ==========================================
    */

    if (teacherStaffId) {
      const existingStaff = await Teacher.findOne({
        school,
        staffId: teacherStaffId,
      });

      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: "Staff ID already exists.",
        });
      }
    }

    /*
    ==========================================
    CHECK USER ACCOUNT
    ==========================================
    */

    const existingUser = await User.findOne({
      school,
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    /*
    ==========================================
    CREATE USER LOGIN
    ==========================================
    */

    const user = await User.create({
      school,
      fullName: teacherName,
      email: email.toLowerCase(),
      phone,
      password: teacherPassword,
      role: "teacher",
    });

    /*
    ==========================================
    FORMAT SUBJECTS
    ==========================================
    */

    let teacherSubjects = [];

    if (subjects) {
      if (Array.isArray(subjects)) {
        teacherSubjects = subjects;
      } else {
        teacherSubjects = subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    /*
    ==========================================
    CREATE TEACHER PROFILE
    ==========================================
    */

    const teacher = await Teacher.create({
      school,
      userId: user._id,

      fullName: teacherName,
      email: email.toLowerCase(),
      phone,

      password: teacherPassword,

      gender,
      dateOfBirth,

      staffId: teacherStaffId,

      department,
      designation: designation || "Teacher",

      qualification,

      employmentDate,

      classTeacherOf,

      address,

      subjects: teacherSubjects,

      passport: req.file?.path || "",

      status: "active",
    });

    /*
    ==========================================
    RESPONSE
    ==========================================
    */

    const populatedTeacher = await Teacher.findById(
      teacher._id
    ).populate("userId", "-password");

    return res.status(201).json({
      success: true,
      message: "Teacher created successfully.",
      data: populatedTeacher,
    });

  } catch (error) {
  console.error("========== CREATE TEACHER ERROR ==========");
  console.error(error);

  if (error.errors) {
    console.error(error.errors);
  }

  return res.status(500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
}
  }

/*
==================================================
GET ALL TEACHERS
==================================================
*/

export const getTeachers = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const {
      search = "",
      status = "",
      department = "",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      school,
    };

    /*
    ==========================================
    SEARCH
    ==========================================
    */

    if (search) {
      query.$or = [
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          staffId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /*
    ==========================================
    FILTERS
    ==========================================
    */

    if (status) {
      query.status = status;
    }

    if (department) {
      query.department = department;
    }

    /*
    ==========================================
    PAGINATION
    ==========================================
    */

    const currentPage = Number(page);
    const pageSize = Number(limit);

    const skip = (currentPage - 1) * pageSize;

    /*
    ==========================================
    FETCH DATA
    ==========================================
    */

    const teachers = await Teacher.find(query)
      .populate("userId", "-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Teacher.countDocuments(query);

    return res.json({
      success: true,
      count: teachers.length,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
      data: teachers,
    });

  } catch (error) {
    console.error("GET TEACHERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
PART 2 CONTINUES WITH:
- getTeacher()
- updateTeacher()
==================================================
*/

/*
==================================================
GET SINGLE TEACHER
==================================================
*/

export const getTeacher = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      school,
    }).populate("userId", "-password");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    return res.json({
      success: true,
      data: teacher,
    });

  } catch (error) {
    console.error("GET TEACHER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
UPDATE TEACHER
==================================================
*/

export const updateTeacher = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const {
      fullName,
      email,
      phone,
      designation,
      department,
      qualification,
      gender,
      staffId,
      status,
      subjects,
      classTeacherOf,
      employmentDate,
      address,
      passport,
      dateOfBirth,
    } = req.body;

    /*
    ==========================================
    FIND TEACHER
    ==========================================
    */

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      school,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    /*
    ==========================================
    CHECK EMAIL
    ==========================================
    */

    if (
      email &&
      email.toLowerCase() !== teacher.email
    ) {
      const existingEmail = await Teacher.findOne({
        school,
        email: email.toLowerCase(),
        _id: { $ne: teacher._id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    /*
    ==========================================
    CHECK STAFF ID
    ==========================================
    */

    if (staffId && staffId !== teacher.staffId) {
      const existingStaff = await Teacher.findOne({
        school,
        staffId,
        _id: { $ne: teacher._id },
      });

      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: "Staff ID already exists.",
        });
      }
    }

    /*
    ==========================================
    UPDATE TEACHER
    ==========================================
    */

    teacher.fullName =
      fullName ?? teacher.fullName;

    teacher.email =
      email?.toLowerCase() ?? teacher.email;

    teacher.phone =
      phone ?? teacher.phone;

    teacher.designation =
      designation ?? teacher.designation;

    teacher.department =
      department ?? teacher.department;

    teacher.qualification =
      qualification ?? teacher.qualification;

    teacher.gender =
      gender ?? teacher.gender;

    teacher.staffId =
      staffId ?? teacher.staffId;

    teacher.status =
      status ?? teacher.status;

    teacher.subjects =
      subjects ?? teacher.subjects;

    teacher.classTeacherOf =
      classTeacherOf ?? teacher.classTeacherOf;

    teacher.employmentDate =
      employmentDate ?? teacher.employmentDate;

    teacher.address =
      address ?? teacher.address;

    teacher.passport =
      passport ?? teacher.passport;

    teacher.dateOfBirth =
      dateOfBirth ?? teacher.dateOfBirth;

    await teacher.save();

    /*
    ==========================================
    SYNC USER ACCOUNT
    ==========================================
    */

    await User.findByIdAndUpdate(
      teacher.userId,
      {
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
        status: teacher.status,
      },
      {
        runValidators: true,
      }
    );

    /*
    ==========================================
    RETURN UPDATED RECORD
    ==========================================
    */

    const updatedTeacher =
      await Teacher.findById(teacher._id)
        .populate("userId", "-password");

    return res.json({
      success: true,
      message: "Teacher updated successfully.",
      data: updatedTeacher,
    });

  } catch (error) {
    console.error("UPDATE TEACHER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
PART 3 CONTINUES WITH:
- deleteTeacher()
- getTeacherStats()
==================================================

/*
==================================================
DELETE TEACHER
==================================================
*/

export const deleteTeacher = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      school,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found.",
      });
    }

    /*
    ==========================================
    DELETE LINKED USER ACCOUNT
    ==========================================
    */

    if (teacher.userId) {
      await User.findByIdAndDelete(
        teacher.userId
      );
    }

    /*
    ==========================================
    DELETE TEACHER PROFILE
    ==========================================
    */

    await teacher.deleteOne();

    return res.json({
      success: true,
      message: "Teacher deleted successfully.",
    });

  } catch (error) {
    console.error(
      "DELETE TEACHER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
ACTIVATE TEACHER
PUT /api/teachers/:id/activate
==================================================
*/

export const activateTeacher = async (req, res) => {

  try {

    const school =
      req.school || req.school?._id;


    const teacher =
      await Teacher.findOneAndUpdate(

        {
          _id: req.params.id,
          school,
        },

        {
          status: "active",
        },

        {
          new: true,
          runValidators: true,
        }

      )
      .populate(
        "userId",
        "-password"
      );


    if (!teacher) {

      return res.status(404).json({

        success:false,

        message:"Teacher not found",

      });

    }


    /*
    ==========================================
    SYNC USER STATUS
    ==========================================
    */

    if (teacher.userId) {

      await User.findByIdAndUpdate(
        teacher.userId._id,
        {
          status:"active",
        }
      );

    }


    return res.json({

      success:true,

      message:
      "Teacher activated successfully",

      data:teacher,

    });


  }
  catch(error){

    console.error(
      "ACTIVATE TEACHER ERROR:",
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
SUSPEND TEACHER
PUT /api/teachers/:id/suspend
==================================================
*/

export const suspendTeacher = async (req,res)=>{

  try {

    const school =
      req.school || req.school?._id;


    const teacher =
      await Teacher.findOneAndUpdate(

        {
          _id:req.params.id,
          school,
        },

        {
          status:"suspended",
        },

        {
          new:true,
        }

      );


    if(!teacher){

      return res.status(404).json({

        success:false,

        message:"Teacher not found",

      });

    }


    await User.findByIdAndUpdate(
      teacher.userId,
      {
        status:"suspended",
      }
    );


    return res.json({

      success:true,

      message:
      "Teacher suspended successfully",

      data:teacher,

    });


  }
  catch(error){

    return res.status(500).json({

      success:false,

      message:error.message,

    });

  }

};


/*
==================================================
GET TEACHER STATISTICS
==================================================
*/


/*
==================================================
ADD TEACHER SCHEDULE
POST /api/teachers/:id/schedule
==================================================
*/

export const addTeacherSchedule = async (req, res) => {

  try {

    const school =
      req.school || req.school?._id;


    const teacher =
      await Teacher.findOne({
        _id:req.params.id,
        school,
      });


    if(!teacher){

      return res.status(404).json({

        success:false,

        message:"Teacher not found",

      });

    }


    teacher.schedule =
      req.body.schedule || [];


    await teacher.save();


    return res.json({

      success:true,

      message:
      "Teacher schedule updated successfully",

      data:teacher,

    });


  }
  catch(error){

    console.error(
      "ADD TEACHER SCHEDULE ERROR:",
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
GET TEACHER SCHEDULE
GET /api/teachers/:id/schedule
==================================================
*/

export const getTeacherSchedule = async(req,res)=>{

try{


const school =
req.school || req.school?._id;


const teacher =
await Teacher.findOne({

_id:req.params.id,

school,

})
.select(
"fullName schedule"
);



if(!teacher){

return res.status(404).json({

success:false,

message:"Teacher not found",

});

}



return res.json({

success:true,

data:teacher.schedule || []

});


}
catch(error){

return res.status(500).json({

success:false,

message:error.message,

});

}

};





/*
==================================================
ASSIGN SUBJECTS TO TEACHER
PUT /api/teachers/:id/subjects
==================================================
*/



/*
==================================================
ASSIGN CLASSES TO TEACHER
PUT /api/teachers/:id/classes
==================================================
*/

export const assignClasses = async (req, res) => {

  try {

    const school =
      req.school || req.school?._id;


    const teacher =
      await Teacher.findOne({
        _id: req.params.id,
        school,
      });


    if (!teacher) {

      return res.status(404).json({

        success:false,

        message:"Teacher not found",

      });

    }


    teacher.classes =
      req.body.classes || [];


    await teacher.save();


    return res.json({

      success:true,

      message:
      "Classes assigned successfully",

      data:teacher,

    });


  } catch(error) {

    console.error(
      "ASSIGN CLASSES ERROR:",
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
ASSIGN CLASSES
PUT /api/teachers/:id/classes
==================================================
*/


/*
==================================================
ASSIGN SUBJECTS
PUT /api/teachers/:id/subjects
==================================================
*/

export const assignSubjects = async (req, res) => {

  try {

    const school =
      req.school || req.school?._id;

    const teacher =
      await Teacher.findOne({
        _id: req.params.id,
        school,
      });

    if (!teacher) {

      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });

    }

    teacher.subjects =
      req.body.subjects || [];

    await teacher.save();

    return res.json({

      success: true,

      message:
        "Subjects assigned successfully",

      data: teacher,

    });

  } catch (error) {

    console.error(
      "ASSIGN SUBJECTS ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

/*
==================================================
EXPORT TEACHERS
GET /api/teachers/export
==================================================
*/

export const exportTeachers = async (req, res) => {
  try {

    const school =
      req.school || req.school?._id;

    const teachers = await Teacher.find({
      school,
    })
      .populate("userId", "-password")
      .sort({
        fullName: 1,
      });

    return res.json({
      success: true,
      message: "Teachers exported successfully.",
      count: teachers.length,
      data: teachers,
    });

  } catch (error) {

    console.error(
      "EXPORT TEACHERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/*
==================================================
GET TEACHER ATTENDANCE
GET /api/teachers/:id/attendance
==================================================
*/

export const getTeacherAttendance = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      school,
    }).select("fullName attendance");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.json({
      success: true,
      data: teacher.attendance || [],
    });

  } catch (error) {
    console.error("GET TEACHER ATTENDANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/*
==================================================
MARK TEACHER ATTENDANCE
POST /api/teachers/:id/attendance
==================================================
*/

export const markTeacherAttendance = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      school,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    if (!teacher.attendance) {
      teacher.attendance = [];
    }

    teacher.attendance.push({
      date: req.body.date || new Date(),
      status: req.body.status || "Present",
      remark: req.body.remark || "",
    });

    await teacher.save();

    return res.json({
      success: true,
      message: "Attendance recorded successfully.",
      data: teacher.attendance,
    });

  } catch (error) {
    console.error("MARK TEACHER ATTENDANCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
==================================================
GET TEACHER PERFORMANCE
GET /api/teachers/:id/performance
==================================================
*/

export const getTeacherPerformance = async (req, res) => {
  try {

    const school =
      req.school || req.school?._id;

    const teacher =
      await Teacher.findOne({
        _id: req.params.id,
        school,
      }).select(
        "fullName subjects classTeacherOf status"
      );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    /*
    ==========================================
    Placeholder performance data
    Replace with Result/Attendance analytics later
    ==========================================
    */

    return res.json({
      success: true,
      data: {
        teacher,
        performance: {
          averageScore: 0,
          attendanceRate: 0,
          assignmentsGiven: 0,
          assignmentsMarked: 0,
          classesHandled:
            teacher.classTeacherOf
              ? [teacher.classTeacherOf]
              : [],
          subjects: teacher.subjects || [],
        },
      },
    });

  } catch (error) {

    console.error(
      "GET TEACHER PERFORMANCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/*
==================================================
REMOVE TEACHER SCHEDULE
DELETE /api/teachers/:id/schedule/:scheduleId
==================================================
*/

export const removeTeacherSchedule = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const teacher = await Teacher.findOne({
      _id: req.params.id,
      school,
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    teacher.schedule =
      (teacher.schedule || []).filter(
        (item) =>
          item._id?.toString() !==
          req.params.scheduleId
      );

    await teacher.save();

    return res.json({
      success: true,
      message: "Schedule removed successfully",
      data: teacher.schedule,
    });

  } catch (error) {

    console.error(
      "REMOVE TEACHER SCHEDULE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/*
==================================================
IMPORT TEACHERS
POST /api/teachers/import
==================================================
*/

export const importTeachers = async (req, res) => {

  try {

    return res.status(501).json({

      success: false,

      message:
        "Teacher import is not implemented yet.",

    });

  } catch (error) {

    console.error(
      "IMPORT TEACHERS ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


/*
==================================================
GET TEACHER STATISTICS
==================================================
*/

export const getTeacherStats = async (req, res) => {
  try {
    const school = req.school || req.school?._id;

    const [
      total,
      active,
      inactive,
      suspended,
      male,
      female,
    ] = await Promise.all([
      Teacher.countDocuments({ school }),
      Teacher.countDocuments({ school, status: "active" }),
      Teacher.countDocuments({ school, status: "inactive" }),
      Teacher.countDocuments({ school, status: "suspended" }),
      Teacher.countDocuments({ school, gender: "Male" }),
      Teacher.countDocuments({ school, gender: "Female" }),
    ]);

    const recentTeachers = await Teacher.find({ school })
      .select("fullName designation status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        suspended,
        male,
        female,
        recentTeachers,
      },
    });

  } catch (error) {

    console.error("GET TEACHER STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export default {

  createTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,

  getTeacherStats,

  activateTeacher,
  suspendTeacher,

  assignClasses,
  assignSubjects,

  addTeacherSchedule,
  getTeacherSchedule,
  removeTeacherSchedule,

  getTeacherAttendance,
  getTeacherPerformance,

  importTeachers,
  exportTeachers,

};