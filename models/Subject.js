// models/Subject.js

import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
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
        required: true,
        uppercase: true,
        trim: true,
    },

    shortName: {
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
    CLASSES
    =====================================================
    */

    classes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
        },
    ],



    /*
    =====================================================
    SUBJECT TEACHERS
    =====================================================
    */

    teachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
        },
    ],



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
    SETTINGS
    =====================================================
    */

    category: {
        type: String,
        enum: [
            "core",
            "elective",
            "vocational",
            "religious",
            "language",
            "practical",
            "other",
        ],
        default: "core",
    },

    hasPractical: {
        type: Boolean,
        default: false,
    },

    creditUnit: {
        type: Number,
        default: 1,
        min: 1,
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

subjectSchema.index(
{
    school: 1,
    code: 1,
},
{
    unique: true,
}
);

subjectSchema.index(
{
    school: 1,
    name: 1,
},
{
    unique: true,
}
);

subjectSchema.index({
    school: 1,
    department: 1,
});

subjectSchema.index({
    school: 1,
    status: 1,
});



/*
=========================================================
VIRTUALS
=========================================================
*/

subjectSchema.virtual("teacherCount").get(function () {
    return this.teachers.length;
});

subjectSchema.virtual("classCount").get(function () {
    return this.classes.length;
});



export default mongoose.model(
    "Subject",
    subjectSchema
);