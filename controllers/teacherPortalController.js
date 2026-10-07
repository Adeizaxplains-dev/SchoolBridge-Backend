import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";
import Result from "../models/Result.js";
import Message from "../models/Message.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";



/*
=========================================================
GET LOGGED-IN TEACHER
=========================================================
*/

const getLoggedInTeacher = async (req)=>{

    const teacher =
    await Teacher.findOne({

        userId:req.user._id,

        school:req.school,

    });



    if(!teacher){

        throw new Error(
            "Teacher profile not found."
        );

    }


    return teacher;

};






/*
=========================================================
TEACHER DASHBOARD
GET /api/teacher-portal/dashboard
=========================================================
*/

export const getTeacherDashboard =
async(req,res)=>{

try{


const teacher =
await getLoggedInTeacher(req);



const students =
await Student.find({

school:req.school,

class:
teacher.classTeacherOf,

});



const attendance =
await Attendance.find({

school:req.school,

teacherId:teacher._id,

})
.limit(20);



const results =
await Result.find({

school:req.school,

teacherId:teacher._id,

})
.limit(20);



const messages =
await Message.find({

school:req.school,

})
.sort({
createdAt:-1
})
.limit(5);




res.json({

success:true,


data:{


teacher:{

id:teacher._id,

fullName:
teacher.fullName,

email:
teacher.email,

phone:
teacher.phone,

classTeacherOf:
teacher.classTeacherOf,

subjects:
teacher.subjects,

},



statistics:{


totalStudents:
students.length,


totalSubjects:
teacher.subjects.length,


attendanceRecords:
attendance.length,


results:
results.length,


},



recentMessages:
messages,


}



});



}catch(error){


console.error(
"TEACHER DASHBOARD ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message

});


}

};







/*
=========================================================
TEACHER PROFILE
=========================================================
*/

export const getTeacherProfile =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



res.json({

success:true,

data:teacher

});



}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};





/*
=========================================================
GET TEACHER CLASSES
=========================================================
*/


export const getTeacherClasses =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



res.json({

success:true,


data:{


classTeacherOf:
teacher.classTeacherOf,


subjects:
teacher.subjects,


}



});



}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}

};

/*
=========================================================
GET MY STUDENTS
GET /api/teacher-portal/students
=========================================================
*/

export const getMyStudents =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const students =
await Student.find({

school:req.school,

class:
teacher.classTeacherOf,

})
.populate(
"parent",
"fullName phone email"
)
.sort({
firstName:1
});



res.json({

success:true,

count:
students.length,

data:
students,

});



}catch(error){


console.error(
"GET TEACHER STUDENTS ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message,

});


}

};







/*
=========================================================
GET TEACHER RESULTS
GET /api/teacher-portal/results
=========================================================
*/

export const getTeacherResults =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const results =
await Result.find({

school:req.school,

teacherId:
teacher._id,

})

.populate(
"studentId",
"firstName lastName admissionNumber"
)

.sort({

createdAt:-1

});



res.json({

success:true,

data:results,

});



}catch(error){


console.error(
"GET TEACHER RESULTS ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message,

});


}

};







/*
=========================================================
GET TEACHER ATTENDANCE
GET /api/teacher-portal/attendance
=========================================================
*/

export const getTeacherAttendance =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const attendance =
await Attendance.find({

school:req.school,

teacherId:
teacher._id,

})

.populate(

"student",

"firstName lastName admissionNumber"

)

.sort({

createdAt:-1

});



res.json({

success:true,

data:attendance,

});



}catch(error){


console.error(
"GET TEACHER ATTENDANCE ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message,

});


}

};








/*
=========================================================
TEACHER ANALYTICS
GET /api/teacher-portal/analytics
=========================================================
*/

export const getTeacherAnalytics =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const totalStudents =
await Student.countDocuments({

school:req.school,

class:
teacher.classTeacherOf,

});



const totalAssignments =
await Assignment.countDocuments({

school:req.school,

teacherId:
teacher._id,

});



const totalResults =
await Result.countDocuments({

school:req.school,

teacherId:
teacher._id,

});



const attendanceRecords =
await Attendance.countDocuments({

school:req.school,

teacherId:
teacher._id,

});



res.json({

success:true,


data:{


totalStudents,


totalAssignments,


totalResults,


attendanceRecords,


subjects:
teacher.subjects,


class:
teacher.classTeacherOf,


}



});



}catch(error){


console.error(
"TEACHER ANALYTICS ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message,

});


}

};









/*
=========================================================
CREATE ASSIGNMENT

POST /api/teacher-portal/assignments

=========================================================
*/

export const createAssignment =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const {


title,

description,

subject,

dueDate,

classId,


} = req.body;




const assignment =
await Assignment.create({


school:req.school,


teacherId:
teacher._id,


title,


description,


subject,


classId,


dueDate,


});




res.status(201).json({

success:true,


message:
"Assignment created successfully.",


data:
assignment,


});



}catch(error){


console.error(
"CREATE ASSIGNMENT ERROR:",
error
);



res.status(500).json({

success:false,

message:error.message,

});


}

};

/*
=========================================================
GET TEACHER ASSIGNMENTS

GET /api/teacher-portal/assignments
=========================================================
*/

export const getTeacherAssignments =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const assignments =
await Assignment.find({

school:req.school,

teacherId:
teacher._id,

})

.sort({

createdAt:-1

});



res.json({

success:true,

data:assignments,

});



}catch(error){


console.error(
"GET ASSIGNMENTS ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message,

});


}

};








/*
=========================================================
UPDATE ASSIGNMENT

PUT /api/teacher-portal/assignments/:id

=========================================================
*/

export const updateAssignment =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const assignment =
await Assignment.findOneAndUpdate(

{

_id:req.params.id,

school:req.school,

teacherId:
teacher._id,

},


req.body,


{

new:true,

runValidators:true,

}


);



if(!assignment){

return res.status(404).json({

success:false,

message:
"Assignment not found"

});

}



res.json({

success:true,

message:
"Assignment updated successfully",

data:assignment,

});



}catch(error){


console.error(
"UPDATE ASSIGNMENT ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message,

});


}

};









/*
=========================================================
DELETE ASSIGNMENT

DELETE /api/teacher-portal/assignments/:id

=========================================================
*/

export const deleteAssignment =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const assignment =
await Assignment.findOneAndDelete({

_id:req.params.id,

school:req.school,

teacherId:
teacher._id,


});



if(!assignment){


return res.status(404).json({

success:false,

message:
"Assignment not found"

});


}



res.json({

success:true,

message:
"Assignment deleted successfully"

});



}catch(error){


console.error(
"DELETE ASSIGNMENT ERROR:",
error
);


res.status(500).json({

success:false,

message:error.message,

});


}

};









/*
=========================================================
MARK ATTENDANCE

POST /api/teacher-portal/attendance

=========================================================
*/

export const markAttendance =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const {


studentId,

date,

status,


} = req.body;



const attendance =
await Attendance.create({

school:req.school,

teacherId:
teacher._id,

studentId,

date,

status,

});



res.status(201).json({

success:true,

message:
"Attendance marked successfully",

data:attendance,

});



}catch(error){


console.error(
"MARK ATTENDANCE ERROR:",
error
);



res.status(500).json({

success:false,

message:error.message,

});


}

};









/*
=========================================================
UPLOAD RESULTS

POST /api/teacher-portal/results

=========================================================
*/

export const uploadResults =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const {


studentId,

subject,

score,

grade,

term,

session,


} = req.body;




const result =
await Result.create({

school:req.school,

teacherId:
teacher._id,


studentId,


subject,


score,


grade,


term,


session,


});



res.status(201).json({

success:true,

message:
"Result uploaded successfully",

data:result,


});



}catch(error){


console.error(
"UPLOAD RESULT ERROR:",
error
);



res.status(500).json({

success:false,

message:error.message,

});


}

};









/*
=========================================================
SEND MESSAGE TO STUDENTS/PARENTS

POST /api/teacher-portal/messages

=========================================================
*/

export const sendTeacherMessage =
async(req,res)=>{


try{


const teacher =
await getLoggedInTeacher(req);



const {


receiver,

message,

type,


} = req.body;




const newMessage =
await Message.create({

school:req.school,


sender:

teacher.userId,


receiver,


message,


type,


});



res.status(201).json({

success:true,

message:
"Message sent successfully",

data:newMessage,


});



}catch(error){


console.error(
"SEND MESSAGE ERROR:",
error
);



res.status(500).json({

success:false,

message:error.message,

});


}

};

/*
=========================================================
GET TEACHER MESSAGES

GET /api/teacher-portal/messages
=========================================================
*/

export const getTeacherMessages = async (req, res) => {
  try {

    const teacher = await getLoggedInTeacher(req);

    const messages = await Message.find({
      school: req.school,
      $or: [
        { sender: teacher.userId },
        { receiver: teacher.userId },
      ],
    })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: messages.length,
      data: messages,
    });

  } catch (error) {

    console.error(
      "GET TEACHER MESSAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
=========================================================
UPDATE TEACHER PROFILE
=========================================================
*/

export const updateTeacherProfile = async (req, res) => {
  try {
    const teacher = await getLoggedInTeacher(req);

    const allowedFields = [
      "fullName",
      "phone",
      "address",
      "qualification",
      "gender",
      "passport",
      "dateOfBirth",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });

    await teacher.save();

    await User.findByIdAndUpdate(teacher.userId, {
      fullName: teacher.fullName,
      phone: teacher.phone,
    });

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      data: teacher,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================================
GET TEACHER SUBJECTS
=========================================================
*/

export const getTeacherSubjects = async (req, res) => {
  try {
    const teacher = await getLoggedInTeacher(req);

    return res.json({
      success: true,
      data: teacher.subjects || [],
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
=========================================================
GET TEACHER STUDENTS
=========================================================
*/

export const getTeacherStudents = async (req, res) => {
  return getMyStudents(req, res);
};

/*
=========================================================
SAVE RESULT
=========================================================
*/

export const saveResult = async (req, res) => {
  try {

    const result = await Result.create({
      ...req.body,
      school: req.school,
      teacherId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Result saved successfully.",
      data: result,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/*
=========================================================
PUBLISH RESULT
=========================================================
*/

export const publishResult = async (req, res) => {

  try {

    const { ids } = req.body;

    await Result.updateMany(
      {
        _id: { $in: ids },
        school: req.school,
      },
      {
        published: true,
        publishedAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Results published successfully.",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};