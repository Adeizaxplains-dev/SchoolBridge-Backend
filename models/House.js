// models/House.js

import mongoose from "mongoose";

const houseSchema = new mongoose.Schema(
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
    },



    /*
    =====================================================
    HOUSE TYPE
    =====================================================
    */

    type: {
        type: String,
        enum: [

            "sports",

            "hostel",

            "mixed",

        ],
        default: "sports",
    },



    /*
    =====================================================
    HOSTEL INFORMATION
    =====================================================
    */

    gender: {
        type: String,
        enum: [

            "male",

            "female",

            "mixed",

        ],
        default: "mixed",
    },

    capacity: {
        type: Number,
        default: 0,
        min: 0,
    },



    /*
    =====================================================
    MANAGEMENT
    =====================================================
    */

    houseMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null,
    },

    assistantHouseMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        default: null,
    },



    /*
    =====================================================
    STUDENTS
    =====================================================
    */

    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
    ],



    /*
    =====================================================
    PREFECTS
    =====================================================
    */

    prefects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
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
    LOCATION
    =====================================================
    */

    location: {
        type: String,
        default: "",
    },

    building: {
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

houseSchema.index(
{
    school: 1,
    name: 1,
},
{
    unique: true,
}
);

houseSchema.index(
{
    school: 1,
    code: 1,
},
{
    unique: true,
}
);

houseSchema.index({
    school: 1,
    status: 1,
});

houseSchema.index({
    school: 1,
    gender: 1,
});



/*
=========================================================
VIRTUALS
=========================================================
*/

houseSchema.virtual("studentCount").get(function(){

    return this.students.length;

});

houseSchema.virtual("occupancy").get(function(){

    if(this.capacity === 0){

        return 0;

    }

    return Math.round(
        (this.students.length / this.capacity) * 100
    );

});



export default mongoose.model(
    "House",
    houseSchema
);