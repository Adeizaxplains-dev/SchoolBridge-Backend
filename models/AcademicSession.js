// models/AcademicSession.js

import mongoose from "mongoose";

const academicSessionSchema = new mongoose.Schema(
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
    SESSION INFORMATION
    =====================================================
    */

    name: {
        type: String,
        required: true,
        trim: true,
    },

    code: {
        type: String,
        trim: true,
        uppercase: true,
    },



    /*
    =====================================================
    DATES
    =====================================================
    */

    startDate: {
        type: Date,
        required: true,
    },

    endDate: {
        type: Date,
        required: true,
    },



    /*
    =====================================================
    STATUS
    =====================================================
    */

    status: {
        type: String,
        enum: [
            "upcoming",
            "active",
            "completed",
            "archived",
        ],
        default: "upcoming",
    },

    isCurrent: {
        type: Boolean,
        default: false,
    },



    /*
    =====================================================
    DESCRIPTION
    =====================================================
    */

    description: {
        type: String,
        default: "",
        trim: true,
    },



    /*
    =====================================================
    STATISTICS
    =====================================================
    */

    totalTerms: {
        type: Number,
        default: 0,
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

academicSessionSchema.index({
    school: 1,
    name: 1,
},
{
    unique: true,
});

academicSessionSchema.index({
    school: 1,
    isCurrent: 1,
});

academicSessionSchema.index({
    school: 1,
    status: 1,
});



/*
=========================================================
VIRTUAL
=========================================================
*/

academicSessionSchema.virtual("duration").get(function () {

    const oneDay = 1000 * 60 * 60 * 24;

    return Math.ceil(
        (this.endDate - this.startDate) /
        oneDay
    );

});



/*
=========================================================
VALIDATION
=========================================================
*/

academicSessionSchema.pre("save", function () {

    if (this.endDate <= this.startDate) {
        throw new Error(
            "End date must be after start date."
        );
    }

});
      


export default mongoose.model(
    "AcademicSession",
    academicSessionSchema
);