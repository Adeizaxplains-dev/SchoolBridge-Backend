// ============================================================
// backend/models/ClassArm.js
// SchoolBridge Enterprise
// Class Arm Model
// ============================================================

import mongoose from "mongoose";

const { Schema } = mongoose;

// ============================================================
// SCHEMA
// ============================================================

const classArmSchema = new Schema(
    {
        // =====================================================
        // RELATIONSHIPS
        // =====================================================

        school: {
            type: Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        // Optional: the arm form creates school-level labels (A, B, Gold)
        // that can later be attached to a specific class.
        class: {
            type: Schema.Types.ObjectId,
            ref: "Class",
            default: null,
            index: true,
        },

        // =====================================================
        // ARM DETAILS
        // =====================================================

        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            trim: true,
            uppercase: true,
            default: "",
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        // =====================================================
        // CAPACITY
        // =====================================================

        capacity: {
            type: Number,
            default: 0,
            min: 0,
        },

        currentStudents: {
            type: Number,
            default: 0,
            min: 0,
        },

        // =====================================================
        // CLASS TEACHER
        // =====================================================

        classTeacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            default: null,
        },

        assistantTeacher: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            default: null,
        },

        // =====================================================
        // STATUS
        // =====================================================

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

                // =====================================================
        // AUDIT
        // =====================================================

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ============================================================
// INDEXES
// ============================================================

classArmSchema.index({
    school: 1,
    class: 1,
    name: 1,
}, {
    unique: true,
});

classArmSchema.index({
    school: 1,
    isActive: 1,
});

classArmSchema.index({
    class: 1,
    isDeleted: 1,
});

// ============================================================
// VIRTUALS
// ============================================================

classArmSchema.virtual("availableSlots").get(function () {
    return Math.max(
        0,
        (this.capacity || 0) - (this.currentStudents || 0)
    );
});

classArmSchema.set("toJSON", {
    virtuals: true,
});

classArmSchema.set("toObject", {
    virtuals: true,
});

// ============================================================
// INSTANCE METHODS
// ============================================================

classArmSchema.methods.hasAvailableSpace = function () {
    return this.currentStudents < this.capacity;
};

classArmSchema.methods.incrementStudentCount = async function () {
    this.currentStudents += 1;
    return this.save();
};

classArmSchema.methods.decrementStudentCount = async function () {
    if (this.currentStudents > 0) {
        this.currentStudents -= 1;
    }

    return this.save();
};


// ============================================================
// STATIC METHODS
// ============================================================

classArmSchema.statics.getActiveArms = function (schoolId) {
    return this.find({
        school: schoolId,
        isActive: true,
        isDeleted: false,
    }).sort({
        name: 1,
    });
};

classArmSchema.statics.getClassArms = function (schoolId, classId) {
    return this.find({
        school: schoolId,
        class: classId,
        isDeleted: false,
    }).sort({
        name: 1,
    });
};


// ============================================================
// MIDDLEWARE
// ============================================================

classArmSchema.pre("save", function () {

    if (this.name) {
        this.name = this.name.trim();
    }

    if (this.code) {
        this.code = this.code.trim().toUpperCase();
    }

    if (
        this.currentStudents > this.capacity &&
        this.capacity > 0
    ) {
        throw new Error("Current students cannot exceed arm capacity.");
    }


});


// ============================================================
// MODEL
// ============================================================

const ClassArm = mongoose.model(
    "ClassArm",
    classArmSchema
);


// ============================================================
// EXPORT
// ============================================================

export default ClassArm;