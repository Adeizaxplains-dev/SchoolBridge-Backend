// models/Class.js

import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
{
    /*
    =====================================================
    SCHOOL
    =====================================================
    */

    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
        required: true,
        index: true,
    },



    /*
    =====================================================
    SESSION
    =====================================================
    */

    academicSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicSession",
        required: true,
        index: true,
    },



    /*
    =====================================================
    BASIC INFORMATION
    =====================================================
    */

    name: {
        type: String,
        required: true,
        trim: true,
    },

    code: {
        type: String,
        uppercase: true,
        trim: true,
    },

    level: {
        type: Number,
        required: true,
    },



    /*
    =====================================================
    ARM
    =====================================================
    */

    arm: {
        type: String,
        default: "",
        trim: true,
    },



    /*
    =====================================================
    DEPARTMENT
    =====================================================
    */

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null,
    },



    /*
    =====================================================
    CLASS TEACHER
    =====================================================
    */

    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null,
    },



    /*
    =====================================================
    FEE STRUCTURE
    =====================================================
    */

    feeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
        default: null,
    },



    /*
    =====================================================
    GRADING SYSTEM
    =====================================================
    */

    gradingSystem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GradingSystem",
        default: null,
    },



    /*
    =====================================================
    LIMITS
    =====================================================
    */

    capacity: {
        type: Number,
        default: 40,
        min: 1,
    },

    currentStudents: {
        type: Number,
        default: 0,
    },



    /*
    =====================================================
    STATUS
    =====================================================
    */

    status: {
        type: String,
        enum: [
            "active",
            "inactive",
            "archived",
        ],
        default: "active",
    },



    /*
    =====================================================
    DESCRIPTION
    =====================================================
    */

    description: {
        type: String,
        default: "",
    },



    /*
    =====================================================
    AUDIT
    =====================================================
    */

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },



    /*
    =====================================================
    SOFT DELETE
    =====================================================
    */

    isDeleted: {
        type: Boolean,
        default: false,
    },

},
{
    timestamps: true,
}
);



/*
=========================================================
INDEXES
=========================================================
*/

classSchema.index(
{
    school: 1,
    academicSession: 1,
    name: 1,
    arm: 1,
},
{
    unique: true,
}
);

classSchema.index({
    school: 1,
    department: 1,
});

classSchema.index({
    school: 1,
    classTeacher: 1,
});

classSchema.index({
    school: 1,
    feeStructure: 1,
});

classSchema.index({
    school: 1,
    gradingSystem: 1,
});



/*
=========================================================
VIRTUAL
=========================================================
*/

classSchema.virtual("availableSeats").get(function () {

    return Math.max(
        0,
        this.capacity - this.currentStudents
    );

});



/*
=========================================================
VALIDATION
=========================================================
*/

classSchema.pre(
    "save",
    function (){

        if(this.currentStudents > this.capacity){

            throw new Error("Current students cannot exceed class capacity.");

        }


    }
);



export default mongoose.model(
    "Class",
    classSchema
);