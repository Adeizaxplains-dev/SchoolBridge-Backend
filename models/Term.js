// ============================================================
// backend/models/Term.js
// SchoolBridge Enterprise
// Academic Term Model
// ============================================================

import mongoose from "mongoose";

const { Schema } = mongoose;

// ============================================================
// CONSTANTS
// ============================================================

const TERM_NUMBERS = [1, 2, 3];

const TERM_STATUSES = [
    "Active",
    "Inactive",
    "Archived",
];

// ============================================================
// TERM SCHEMA
// ============================================================

const termSchema = new Schema(
    {
        // ========================================================
        // SCHOOL
        // ========================================================

        school: {
            type: Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        // ========================================================
        // ACADEMIC SESSION
        // ========================================================

        academicSession: {
            type: Schema.Types.ObjectId,
            ref: "AcademicSession",
            required: true,
            index: true,
        },

        // ========================================================
        // BASIC INFORMATION
        // ========================================================

        name: {
            type: String,
            required: true,
            trim: true,
        },

        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        // ========================================================
        // TERM NUMBER
        //
        // CANONICAL FIELD
        //
        // 1 = First Term
        // 2 = Second Term
        // 3 = Third Term
        // ========================================================

        termNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 3,
            validate: {
                validator: Number.isInteger,
                message:
                    "Term number must be an integer between 1 and 3.",
            },
        },

        // ========================================================
        // POSITION
        //
        // BACKWARD COMPATIBILITY FIELD
        //
        // Existing frontend/backend code may still use position.
        //
        // termNumber remains the source of truth.
        // ========================================================

        position: {
            type: Number,
            min: 1,
            max: 3,
            validate: {
                validator: Number.isInteger,
                message:
                    "Position must be an integer between 1 and 3.",
            },
        },

        // ========================================================
        // TERM DATES
        // ========================================================

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        // ========================================================
        // STATUS
        // ========================================================

        status: {
            type: String,
            enum: TERM_STATUSES,
            default: "Active",
            index: true,
        },

        // ========================================================
        // CURRENT TERM
        // ========================================================

        isCurrent: {
            type: Boolean,
            default: false,
            index: true,
        },

        // ========================================================
        // DESCRIPTION
        // ========================================================

        description: {
            type: String,
            trim: true,
            default: "",
        },

        // ========================================================
        // SOFT DELETE
        // ========================================================

        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        // ========================================================
        // AUDIT
        // ========================================================

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
// VALIDATION
// ============================================================

termSchema.pre("validate", function () {
    // ========================================================
    // DATE VALIDATION
    // ========================================================

    if (
        this.startDate &&
        this.endDate &&
        this.endDate <= this.startDate
    ) {
        throw new Error("End date must be after start date.");
    }

    // ========================================================
    // TERM NUMBER VALIDATION
    // ========================================================

    if (
        this.termNumber !== undefined &&
        !TERM_NUMBERS.includes(this.termNumber)
    ) {
        throw new Error("Term number must be 1, 2, or 3.");
    }

    // ========================================================
    // POSITION COMPATIBILITY
    //
    // If position is omitted, automatically mirror
    // termNumber.
    // ========================================================

    if (
        this.termNumber !== undefined &&
        this.position === undefined
    ) {
        this.position = this.termNumber;
    }

    // ========================================================
    // TERM NUMBER / POSITION CONSISTENCY
    // ========================================================

    if (
        this.termNumber !== undefined &&
        this.position !== undefined &&
        this.termNumber !== this.position
    ) {
        throw new Error("Term number and position must be the same.");
    }

});

// ============================================================
// INDEXES
// ============================================================

// ============================================================
// FAST LOOKUP
// ============================================================

termSchema.index({
    school: 1,
    academicSession: 1,
});

// ============================================================
// UNIQUE TERM NUMBER PER ACADEMIC SESSION
//
// One school + one academic session can have:
//
// Term 1
// Term 2
// Term 3
//
// but cannot have two Term 1 records.
//
// IMPORTANT:
// Soft-deleted records are excluded so a deleted term number
// can be recreated.
// ============================================================

termSchema.index(
    {
        school: 1,
        academicSession: 1,
        termNumber: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false,
        },
    }
);

// ============================================================
// UNIQUE TERM NAME PER SESSION
// ============================================================

termSchema.index(
    {
        school: 1,
        academicSession: 1,
        name: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false,
        },
    }
);

// ============================================================
// UNIQUE TERM CODE PER SESSION
// ============================================================

termSchema.index(
    {
        school: 1,
        academicSession: 1,
        code: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false,
        },
    }
);

// ============================================================
// POSITION COMPATIBILITY INDEX
//
// Keep this because existing SchoolBridge code may query
// position.
//
// termNumber remains the canonical ordering field.
// ============================================================

termSchema.index(
    {
        school: 1,
        academicSession: 1,
        position: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            isDeleted: false,
        },
    }
);

// ============================================================
// ONLY ONE CURRENT TERM PER SCHOOL
//
// Deleted terms cannot remain the current term.
// ============================================================

termSchema.index(
    {
        school: 1,
        isCurrent: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            isCurrent: true,
            isDeleted: false,
        },
    }
);

// ============================================================
// VIRTUAL: IS EXPIRED
// ============================================================

termSchema.virtual("isExpired").get(function () {
    if (!this.endDate) {
        return false;
    }

    return this.endDate < new Date();
});

// ============================================================
// VIRTUAL: IS RUNNING
// ============================================================

termSchema.virtual("isRunning").get(function () {
    if (
        !this.startDate ||
        !this.endDate
    ) {
        return false;
    }

    const now = new Date();

    return (
        now >= this.startDate &&
        now <= this.endDate
    );
});

// ============================================================
// JSON / OBJECT VIRTUALS
// ============================================================

termSchema.set("toJSON", {
    virtuals: true,
});

termSchema.set("toObject", {
    virtuals: true,
});

// ============================================================
// MODEL
// ============================================================

const Term =
    mongoose.models.Term ||
    mongoose.model(
        "Term",
        termSchema
    );

// ============================================================
// EXPORT
// ============================================================

export default Term;