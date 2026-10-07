// ============================================================
// backend/controllers/studentController.js
// SchoolBridge Enterprise Student Controller
// Part 1
// ============================================================

import Student from "../models/Student.js";
import Parent from "../models/Parent.js";
import School from "../models/School.js";



// ============================================================
// SHARED HELPERS
// ============================================================

const getSchoolId = (req) => {

    if (!req.school) {
        return null;
    }

    if (typeof req.school === "string") {
        return req.school;
    }

    if (req.school._id) {
        return req.school._id;
    }

    return req.school;

};



// ============================================================
// CREATE STUDENT
// ============================================================

export const createStudent = async (req, res) => {

    try {

        const schoolId = getSchoolId(req);

        if (!schoolId) {

            return res.status(401).json({

                success: false,

                message: "School context not found.",

            });

        }



        /*
        =====================================================
        VERIFY SCHOOL
        =====================================================
        */

        const schoolRecord = await School.findById(schoolId);

        if (!schoolRecord) {

            return res.status(404).json({

                success: false,

                message: "School not found.",

            });

        }



        /*
        =====================================================
        CHECK STUDENT LIMIT
        =====================================================
        */

        const totalStudents = await Student.countDocuments({

            school: schoolId,

        });

        if (

            schoolRecord.studentLimit &&

            totalStudents >= schoolRecord.studentLimit

        ) {

            return res.status(403).json({

                success: false,

                message: "Student limit reached.",

            });

        }



        const {

            // PERSONAL

            firstName,
            middleName,
            lastName,
            gender,
            dateOfBirth,
            placeOfBirth,
            nationality,
            stateOfOrigin,
            localGovernment,
            religion,
            motherTongue,
            primaryLanguage,
            bloodGroup,
            genotype,

            // CONTACT

            email,
            phone,
            alternatePhone,
            address,
            city,
            state,
            country,
            postalCode,
            landmark,

            // ACADEMIC

            admissionNumber,
            admissionDate,
            classId,
            sectionId,
            sessionId,
            houseId,
            status,

            // PARENT

            parentId,

            // MEDICAL

            allergies,
            medicalConditions,
            medications,
            specialNeeds,
            hospital,
            doctor,
            emergencyMedicalContact,
            healthInsurance,
            medicalNotes,

            // DOCUMENTS

            passport,
            birthCertificate,
            previousResult,
            transferLetter,
            medicalReport,
            immunizationCard,
            parentIdentityDocument,
            otherDocument,

        } = req.body;



        /*
        =====================================================
        CHECK ADMISSION NUMBER
        =====================================================
        */

        const existingStudent = await Student.findOne({

            school: schoolId,

            admissionNumber,

        });

        if (existingStudent) {

            return res.status(400).json({

                success: false,

                message: "Admission number already exists.",

            });

        }



        /*
        =====================================================
        CREATE STUDENT
        =====================================================
        */

        const student = await Student.create({

            school: schoolId,

            // PERSONAL

            firstName,
            middleName,
            lastName,
            gender,
            dateOfBirth,
            placeOfBirth,
            nationality,
            stateOfOrigin,
            localGovernment,
            religion,
            motherTongue,
            primaryLanguage,
            bloodGroup,
            genotype,

            // CONTACT

            email,
            phone,
            alternatePhone,
            address,
            city,
            state,
            country,
            postalCode,
            landmark,

            // ACADEMIC

            admissionNumber,
            admissionDate,
            classId,
            sectionId,
            sessionId,
            houseId,
            status: status || "Active",

            // PARENT

            parent: parentId || null,

            // MEDICAL

            allergies,
            medicalConditions,
            medications,
            specialNeeds,
            hospital,
            doctor,
            emergencyMedicalContact,
            healthInsurance,
            medicalNotes,

            // DOCUMENTS

            passport,
            birthCertificate,
            previousResult,
            transferLetter,
            medicalReport,
            immunizationCard,
            parentIdentityDocument,
            otherDocument,

        });



        /*
        =====================================================
        LINK TO PARENT
        =====================================================
        */

        if (parentId) {

            await Parent.findByIdAndUpdate(

                parentId,

                {

                    $addToSet: {

                        children: student._id,

                    },

                }

            );

        }



        /*
        =====================================================
        RETURN CREATED STUDENT
        =====================================================
        */

        const createdStudent = await Student.findById(student._id)

            .populate("parent", "fullName email phone")

            .populate("classId")

            .populate("sectionId")

            .populate("sessionId")

            .populate("houseId");



        return res.status(201).json({

            success: true,

            message: "Student created successfully.",

            data: createdStudent,

        });

    } catch (error) {

        console.error("CREATE STUDENT ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// ============================================================
// GET ALL STUDENTS
// ============================================================

export const getStudents = async (req, res) => {

    try {

        const schoolId = getSchoolId(req);

        if (!schoolId) {

            return res.status(401).json({

                success: false,

                message: "School context not found.",

            });

        }

        const {

            search = "",
            classId = "",
            sessionId = "",
            gender = "",
            status = "",
            feeStatus = "",
            page = 1,
            limit = 10,

        } = req.query;

        const query = {

            school: schoolId,

        };



        /*
        =====================================================
        SEARCH
        =====================================================
        */

        if (search) {

            query.$or = [

                {
                    firstName: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    middleName: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    lastName: {
                        $regex: search,
                        $options: "i",
                    },
                },

                {
                    admissionNumber: {
                        $regex: search,
                        $options: "i",
                    },
                },

            ];

        }



        /*
        =====================================================
        FILTERS
        =====================================================
        */

        if (classId) query.classId = classId;

        if (sessionId) query.sessionId = sessionId;

        if (gender) query.gender = gender;

        if (status) query.status = status;

        if (feeStatus) query.feeStatus = feeStatus;



        /*
        =====================================================
        PAGINATION
        =====================================================
        */

        const currentPage = Number(page);

        const pageSize = Number(limit);

        const skip = (currentPage - 1) * pageSize;



        const students = await Student.find(query)

            .populate("parent", "fullName email phone")

            .populate("classId")

            .populate("sectionId")

            .populate("sessionId")

            .populate("houseId")

            .sort({

                createdAt: -1,

            })

            .skip(skip)

            .limit(pageSize);



        const total = await Student.countDocuments(query);



        return res.json({

            success: true,

            count: students.length,

            pagination: {

                total,

                page: currentPage,

                limit: pageSize,

                pages: Math.ceil(total / pageSize),

            },

            data: students,

        });

    } catch (error) {

        console.error("GET STUDENTS ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};



// ============================================================
// GET RECENT STUDENTS
// ============================================================

export const getRecentStudents = async (req, res) => {

    try {

        const schoolId = getSchoolId(req);

        if (!schoolId) {

            return res.status(401).json({

                success: false,

                message: "School context not found.",

            });

        }

        const limit = Number(req.query.limit) || 8;

        const students = await Student.find({

            school: schoolId,

        })

            .select(

                `
                firstName
                middleName
                lastName
                admissionNumber
                classId
                passport
                feeStatus
                status
                createdAt
                `
            )

            .populate(

                "classId",

                "name"

            )

            .sort({

                createdAt: -1,

            })

            .limit(limit);



        return res.status(200).json({

            success: true,

            data: students,

        });

    } catch (error) {

        console.error("GET RECENT STUDENTS ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};



// ============================================================
// GET SINGLE STUDENT
// ============================================================

export const getStudent = async (req, res) => {

    try {

        const schoolId = getSchoolId(req);

        if (!schoolId) {

            return res.status(401).json({

                success: false,

                message: "School context not found.",

            });

        }

        const student = await Student.findOne({

            _id: req.params.id,

            school: schoolId,

        })

            .populate("parent", "fullName email phone")

            .populate("classId")

            .populate("sectionId")

            .populate("sessionId")

            .populate("houseId");



        if (!student) {

            return res.status(404).json({

                success: false,

                message: "Student not found.",

            });

        }



        return res.json({

            success: true,

            data: student,

        });

    } catch (error) {

        console.error("GET STUDENT ERROR:", error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};

// ============================================================
// UPDATE STUDENT
// ============================================================

export const updateStudent = async (req, res) => {

    try {

        const schoolId = getSchoolId(req);

        if (!schoolId) {

            return res.status(401).json({

                success: false,

                message: "School context not found.",

            });

        }



        const student = await Student.findOne({

            _id: req.params.id,

            school: schoolId,

        });



        if (!student) {

            return res.status(404).json({

                success:false,

                message:"Student not found.",

            });

        }



        const oldParent =
            student.parent?.toString() || null;



        /*
        =====================================================
        CHECK ADMISSION NUMBER CHANGE
        =====================================================
        */

        if (

            req.body.admissionNumber &&

            req.body.admissionNumber !== student.admissionNumber

        ) {

            const existing =
                await Student.findOne({

                    school: schoolId,

                    admissionNumber:
                        req.body.admissionNumber,

                    _id:{
                        $ne: student._id
                    }

                });



            if(existing){

                return res.status(400).json({

                    success:false,

                    message:
                    "Admission number already exists.",

                });

            }

        }



        /*
        =====================================================
        UPDATE ALLOWED FIELDS
        =====================================================
        */

        const fields = [

            "firstName",
            "middleName",
            "lastName",
            "gender",
            "dateOfBirth",
            "placeOfBirth",
            "nationality",
            "stateOfOrigin",
            "localGovernment",
            "religion",
            "motherTongue",
            "primaryLanguage",
            "bloodGroup",
            "genotype",

            "email",
            "phone",
            "alternatePhone",
            "address",
            "city",
            "state",
            "country",
            "postalCode",
            "landmark",

            "admissionNumber",
            "admissionDate",

            "classId",
            "sectionId",
            "sessionId",
            "houseId",

            "status",

            "allergies",
            "medicalConditions",
            "medications",
            "specialNeeds",
            "hospital",
            "doctor",
            "emergencyMedicalContact",
            "healthInsurance",
            "medicalNotes",

            "passport",
            "birthCertificate",
            "previousResult",
            "transferLetter",
            "medicalReport",
            "immunizationCard",
            "parentIdentityDocument",
            "otherDocument",

        ];



        fields.forEach(field => {

            if(req.body[field] !== undefined){

                student[field] =
                    req.body[field];

            }

        });



        if(req.body.parentId !== undefined){

            student.parent =
                req.body.parentId || null;

        }



        await student.save();



        /*
        =====================================================
        UPDATE PARENT RELATIONSHIP
        =====================================================
        */

        const newParent =
            student.parent?.toString() || null;



        if(

            oldParent &&

            oldParent !== newParent

        ){

            await Parent.findByIdAndUpdate(

                oldParent,

                {

                    $pull:{

                        children:student._id

                    }

                }

            );

        }



        if(

            newParent &&

            oldParent !== newParent

        ){

            await Parent.findByIdAndUpdate(

                newParent,

                {

                    $addToSet:{

                        children:student._id

                    }

                }

            );

        }



        const updatedStudent =
            await Student.findById(student._id)

            .populate(

                "parent",

                "fullName email phone"

            )

            .populate("classId")

            .populate("sectionId")

            .populate("sessionId")

            .populate("houseId");



        return res.json({

            success:true,

            message:
            "Student updated successfully.",

            data:updatedStudent,

        });



    }catch(error){

        console.error(
            "UPDATE STUDENT ERROR:",
            error
        );


        return res.status(500).json({

            success:false,

            message:error.message,

        });

    }

};



// ============================================================
// DELETE STUDENT
// ============================================================

export const deleteStudent = async (req,res)=>{

    try{

        const schoolId =
            getSchoolId(req);



        if(!schoolId){

            return res.status(401).json({

                success:false,

                message:"School context not found.",

            });

        }



        const student =
            await Student.findOne({

                _id:req.params.id,

                school:schoolId,

            });



        if(!student){

            return res.status(404).json({

                success:false,

                message:"Student not found.",

            });

        }



        if(student.parent){

            await Parent.findByIdAndUpdate(

                student.parent,

                {

                    $pull:{

                        children:student._id

                    }

                }

            );

        }



        await student.deleteOne();



        return res.json({

            success:true,

            message:
            "Student deleted successfully.",

        });



    }catch(error){

        console.error(
            "DELETE STUDENT ERROR:",
            error
        );


        return res.status(500).json({

            success:false,

            message:error.message,

        });

    }

};



// ============================================================
// STUDENT STATISTICS
// ============================================================

export const getStudentStats = async(req,res)=>{

    try{

        const schoolId =
            getSchoolId(req);



        if(!schoolId){

            return res.status(401).json({

                success:false,

                message:"School context not found.",

            });

        }



        const [

            totalStudents,

            maleStudents,

            femaleStudents,

            activeStudents,

            inactiveStudents,

            suspendedStudents,

        ] = await Promise.all([


            Student.countDocuments({

                school:schoolId

            }),


            Student.countDocuments({

                school:schoolId,

                gender:"Male"

            }),


            Student.countDocuments({

                school:schoolId,

                gender:"Female"

            }),


            Student.countDocuments({

                school:schoolId,

                status:"Active"

            }),


            Student.countDocuments({

                school:schoolId,

                status:"Inactive"

            }),


            Student.countDocuments({

                school:schoolId,

                status:"Suspended"

            }),

        ]);



        return res.json({

            success:true,

            data:{

                totalStudents,

                maleStudents,

                femaleStudents,

                activeStudents,

                inactiveStudents,

                suspendedStudents,

            }

        });



    }catch(error){

        console.error(
            "STUDENT STATS ERROR:",
            error
        );


        return res.status(500).json({

            success:false,

            message:error.message,

        });

    }

};



// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {

    createStudent,

    getStudents,

    getRecentStudents,

    getStudent,

    updateStudent,

    deleteStudent,

    getStudentStats,

};