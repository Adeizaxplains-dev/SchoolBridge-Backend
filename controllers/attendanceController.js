import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

/*

# MARK ATTENDANCE (BULK CLASS MODE)

*/
export const markAttendance = async (req, res) => {
try {
const school = req.school;


const {
  className,
  date,
  attendance,
} = req.body;

if (
  !className ||
  !date ||
  !attendance
) {
  return res.status(400).json({
    success: false,
    message:
      "className, date and attendance are required",
  });
}

const records = [];

for (const studentId in attendance) {
  const student =
    await Student.findOne({
      _id: studentId,
      school,
    });

  if (!student) continue;

  const existing =
    await Attendance.findOne({
      school: schoolId,
      student: studentId,
      date: new Date(date),
    });

  if (existing) continue;

  const status =
    attendance[studentId];

  records.push({
    school: schoolId,
    student: studentId,
    className,
    date,
    status:
      status === "present"
        ? "Present"
        : "Absent",
  });

  /*
  =====================================
  AUTO NOTIFICATION
  =====================================
  */
  if (
    status === "absent"
  ) {
    console.log(
      `ABSENT ALERT -> ${student.name}`
    );

    /*
    await sendWhatsApp({
      phone: student.parentPhone,
      message:
      `${student.name} was absent today`
    });
    */
  }
}

if (
  records.length > 0
) {
  await Attendance.insertMany(
    records
  );
}

return res.status(201).json({
  success: true,
  message:
    "Attendance saved successfully",
  totalSaved:
    records.length,
});


} catch (error) {
console.error(
"ATTENDANCE ERROR:",
error
);


return res.status(500).json({
  success: false,
  message:
    error.message,
});


}
};

 /*

# GET SCHOOL ATTENDANCE

*/
export const getAttendances = async (
req,
res
) => {
try {
const records =
await Attendance.find({
school:
req.school,
})
.populate(
"student",
"name class parentPhone"
)
.sort({
date: -1,
});


return res.json({
  success: true,
  count:
    records.length,
  data: records,
});


} catch (error) {
return res.status(500).json({
success: false,
message:
error.message,
});
}
};

 /*

# STUDENT ATTENDANCE

*/
export const getStudentAttendance =
async (req, res) => {
try {
const records =
await Attendance.find({
school:
req.school,
student:
req.params.id,
}).sort({
date: -1,
});


  return res.json({
    success: true,
    data: records,
  });
} catch (error) {
  return res.status(500).json({
    success: false,
    message:
      error.message,
  });
}

};

/*

# ATTENDANCE DASHBOARD ANALYTICS

*/
export const getAttendanceStats =
async (req, res) => {
try {
const school =
req.school;

  const total =
    await Attendance.countDocuments(
      {
        school:
          school,
      }
    );

  const present =
    await Attendance.countDocuments(
      {
        school:
          school,
        status:
          "Present",
      }
    );

  const absent =
    await Attendance.countDocuments(
      {
        school:
          school,
        status:
          "Absent",
      }
    );

  const attendanceRate =
    total > 0
      ? Number(
          (
            (present /
              total) *
            100
          ).toFixed(
            2
          )
        )
      : 0;

  /*
  ============================
  CLASS PERFORMANCE
  ============================
  */

  const classAnalytics =
    await Attendance.aggregate(
      [
        {
          $match: {
            school:
              req.school,
          },
        },
        {
          $group: {
            _id:
              "$className",

            total:
              {
                $sum: 1,
              },

            present:
              {
                $sum:
                  {
                    $cond:
                      [
                        {
                          $eq:
                            [
                              "$status",
                              "Present",
                            ],
                        },
                        1,
                        0,
                      ],
                  },
              },

            absent:
              {
                $sum:
                  {
                    $cond:
                      [
                        {
                          $eq:
                            [
                              "$status",
                              "Absent",
                            ],
                        },
                        1,
                        0,
                      ],
                  },
              },
          },
        },
      ]
    );

  return res.json({
    success: true,

    data: {
      totalAttendance:
        total,

      totalPresent:
        present,

      totalAbsent:
        absent,

      attendanceRate,

      classAnalytics,
    },
  });
} catch (error) {
  console.error(
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Failed to load attendance analytics",
  });
}

};

 /*

# CLASS ATTENDANCE

*/
export const getClassAttendance =
async (req, res) => {
try {
const {
className,
} = req.params;


  const records =
    await Attendance.find(
      {
        school:
          req.school,
        className,
      }
    )
      .populate(
        "student",
        "name"
      )
      .sort({
        date: -1,
      });

  return res.json({
    success: true,
    data: records,
  });
} catch (error) {
  return res.status(500).json({
    success: false,
    message:
      error.message,
  });
}

};
