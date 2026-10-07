// models/Department.js

import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
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
    DEPARTMENT TYPE
    =====================================================
    */

    type: {
        type: String,
        enum: [

            "nursery",

            "primary",

            "junior",

            "senior",

            "science",

            "commercial",

            "arts",

            "technical",

            "vocational",

            "religious",

            "cambridge",

            "montessori",

            "other",

        ],
        default: "other",
    },



    /*
    =====================================================
    HOD
    =====================================================
    */

    headOfDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null,
    },



    /*
    =====================================================
    RELATED DATA
    =====================================================
    */

    classes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
        },
    ],

    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
        },
    ],

    teachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
        },
    ],



    /*
    =====================================================
    SETTINGS
    =====================================================
    */

    colour: {
        type: String,
        default: "#2563eb",
    },

    icon: {
        type: String,
        default: "",
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

departmentSchema.index(
{
    school: 1,
    name: 1,
},
{
    unique: true,
}
);

departmentSchema.index(
{
    school: 1,
    code: 1,
},
{
    unique: true,
}
);

departmentSchema.index({
    school: 1,
    type: 1,
});

departmentSchema.index({
    school: 1,
    status: 1,
});



/*
=========================================================
VIRTUALS
=========================================================
*/

departmentSchema.virtual("teacherCount").get(function(){

    return this.teachers.length;

});

departmentSchema.virtual("subjectCount").get(function(){

    return this.subjects.length;

});

departmentSchema.virtual("classCount").get(function(){

    return this.classes.length;

});



export default mongoose.model(
    "Department",
    departmentSchema
);