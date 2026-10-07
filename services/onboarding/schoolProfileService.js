// ============================================================
// SchoolBridge Enterprise
// School Profile Service
//
// Part 1
//
// - Imports
// - Validation
// - Duplicate Checker
// - Create School Profile
// ============================================================

// ============================================================
// SchoolBridge Enterprise
// School Profile Service
// ============================================================

import mongoose from "mongoose";

import School from "../../models/School.js";
import Onboarding from "../../models/Onboarding.js";

import {
    ONBOARDING_STEPS,
    DEFAULT_SUBSCRIPTION
} from "./constants.js";

import {
    generateSlug,
    generateSchoolCode,
    normalizeEmail,
    normalizePhone,
    normalizeWebsite,
    normalizeAddress,
    ensureRequiredFields
} from "./helpers.js";

import {
    markStepCompleted
} from "./progressService.js";


// ============================================================
// VALIDATE SCHOOL PROFILE
// ============================================================

const validateSchoolProfile = (data = {}) => {

    ensureRequiredFields(

        data,

        [
            "name",
            "email"
        ]

    );

};



// ============================================================
// CHECK DUPLICATES
// ============================================================

const checkDuplicateSchool = async (

    data,

    excludeSchoolId = null

) => {

    const conditions = [];

    if (data.email) {

        conditions.push({

            email:
                normalizeEmail(data.email)

        });

    }

    if (data.slug) {

        conditions.push({

            slug:
                generateSlug(data.slug)

        });

    }

    if (data.code) {

        conditions.push({

            code:
                data.code.toUpperCase()

        });

    }

    if (!conditions.length) {

        return;

    }

    const query = {

        $or: conditions

    };

    if (excludeSchoolId) {

        query._id = {

            $ne: excludeSchoolId

        };

    }

    const existing =

        await School.findOne(query);

    if (!existing) {

        return;

    }

    if (

        data.email &&

        existing.email === normalizeEmail(data.email)

    ) {

        throw new Error(

            "School email already exists."

        );

    }

    if (

        data.slug &&

        existing.slug === generateSlug(data.slug)

    ) {

        throw new Error(

            "School slug already exists."

        );

    }

    if (

        data.code &&

        existing.code === data.code.toUpperCase()

    ) {

        throw new Error(

            "School code already exists."

        );

    }

};



// ============================================================
// CREATE SCHOOL PROFILE
// ============================================================

export const createSchoolProfile = async (

    schoolData,

    ownerId = null

) => {

    validateSchoolProfile(schoolData);

    const data = {

        ...schoolData,

        name:
            schoolData.name.trim(),

        email:
            normalizeEmail(
                schoolData.email
            ),

        phone:
            normalizePhone(
                schoolData.phone || ""
            ),

        website:
            normalizeWebsite(
                schoolData.website || ""
            ),

        address:
            normalizeAddress(
                schoolData.address || ""
            ),

        slug:

            schoolData.slug

                ? generateSlug(
                    schoolData.slug
                )

                : generateSlug(
                    schoolData.name
                ),

        code:

            schoolData.code

                ? schoolData.code
                    .trim()
                    .toUpperCase()

                : generateSchoolCode(
                    schoolData.name
                ),

        owner:
            ownerId,

        subscriptionPlan:
            DEFAULT_SUBSCRIPTION.plan,

        subscriptionStatus:
            DEFAULT_SUBSCRIPTION.status,

        onboardingCompleted:
            false,

        onboardingPercentage:
            0,

        currentSetupStep:
            ONBOARDING_STEPS.SCHOOL_PROFILE

    };

    await checkDuplicateSchool(data);

    const school =

        await School.create(data);

    /*
    ------------------------------------------------
    Automatically create/update onboarding progress
    ------------------------------------------------
    */

    await markStepCompleted(

        school._id,

        ONBOARDING_STEPS.SCHOOL_PROFILE

    );

    /*
    ------------------------------------------------
    Return fresh document
    ------------------------------------------------
    */

    return await School.findById(

        school._id

    ).populate(

        "owner",

        "name email"

    );

};

// ============================================================
// UPDATE SCHOOL PROFILE
// ============================================================

export const updateSchoolProfile = async (

    schoolId,

    updateData

) => {

    if (

        !mongoose.Types.ObjectId.isValid(
            schoolId
        )

    ) {

        throw new Error(
            "Invalid school ID."
        );

    }

    const school =

        await School.findById(
            schoolId
        );

    if (!school) {

        throw new Error(
            "School not found."
        );

    }

    // Whitelist: never let a client write owner, plan, limits, flags...
    const PROFILE_FIELDS = [
        "name", "slug", "email", "phone", "alternatePhone", "website",
        "address", "city", "state", "country", "motto", "primaryColor",
        "secondaryColor", "schoolType", "ownership", "establishedYear",
        "logo",
    ];

    const updated = Object.fromEntries(
        PROFILE_FIELDS
            .filter((key) => updateData?.[key] !== undefined)
            .map((key) => [key, updateData[key]])
    );

    /*
    ------------------------------------------------
    Normalize fields
    ------------------------------------------------
    */

    if (updated.name) {

        updated.name =
            updated.name.trim();

    }

    if (updated.email) {

        updated.email =
            normalizeEmail(
                updated.email
            );

    }

    if (updated.phone !== undefined) {

        updated.phone =
            normalizePhone(
                updated.phone
            );

    }

    if (updated.website !== undefined) {

        updated.website =
            normalizeWebsite(
                updated.website
            );

    }

    if (updated.address !== undefined) {

        updated.address =
            normalizeAddress(
                updated.address
            );

    }

    /*
    ------------------------------------------------
    Auto-generate slug when name changes
    ------------------------------------------------
    */

    if (
        updated.name &&
        !updated.slug &&
        updated.name !== school.name
    ) {

        updated.slug =
            generateSlug(
                updated.name
            );

    }

    if (updated.slug) {

        updated.slug =
            generateSlug(
                updated.slug
            );

    }

    /*
    ------------------------------------------------
    Normalize school code
    ------------------------------------------------
    */

    if (updated.code) {

        updated.code =
            updated.code
                .trim()
                .toUpperCase();

    }

    /*
    ------------------------------------------------
    Check duplicates
    ------------------------------------------------
    */

    await checkDuplicateSchool(

        updated,

        school._id

    );

    /*
    ------------------------------------------------
    Apply updates
    ------------------------------------------------
    */

    Object.assign(

        school,

        updated

    );

    await school.save();

    /*
    ------------------------------------------------
    Mark onboarding step completed
    ------------------------------------------------
    */

    await markStepCompleted(

        school._id,

        ONBOARDING_STEPS.SCHOOL_PROFILE

    );

    /*
    ------------------------------------------------
    Return fresh document
    ------------------------------------------------
    */

    const createdSchool =
    await School.findById(
        school._id
    )
    .populate(
        "owner",
        "name email"
    );


const onboarding =
    await Onboarding.findOne({
        school: school._id
    });


return {

    success:true,

    school:
        createdSchool,

    onboarding:{

        status:
            onboarding.status,

        progress:
            onboarding.progress,

        currentStep:
            onboarding.currentStep,

        completedSteps:
            onboarding.completedSteps

    }

};

};



// ============================================================
// CONTROLLER COMPATIBILITY
// ============================================================

export const setupSchoolProfile = async (

    schoolId,

    profileData

) => {

    return await updateSchoolProfile(

        schoolId,

        profileData

    );

};



// ============================================================
// GET SCHOOL PROFILE
// ============================================================

export const getSchoolProfile = async (

    schoolId

) => {

    if (

        !mongoose.Types.ObjectId.isValid(
            schoolId
        )

    ) {

        throw new Error(
            "Invalid school ID."
        );

    }

    const school =

        await School.findById(
            schoolId
        )

        .populate(
            "owner",
            "name email"
        );

    if (!school) {

        throw new Error(
            "School not found."
        );

    }

    return school;

};

// ============================================================
// GET ONBOARDING STATUS
// ============================================================

// ============================================================
// GET ONBOARDING STATUS
// ============================================================

export const getOnboardingStatus = async (
    schoolId
) => {

    if(
        !mongoose.Types.ObjectId.isValid(
            schoolId
        )
    ){

        throw new Error(
            "Invalid school ID."
        );

    }


    const school =
        await School.findById(
            schoolId
        )
        .select(
            [
                "name",
                "code",
                "email",
                "logo",
                "onboardingCompleted",
                "onboardingPercentage",
                "currentSetupStep"
            ]
        )
        .lean();



    if(!school){

        throw new Error(
            "School not found."
        );

    }



    let onboarding = null;


    /*
    ==========================================
    ONBOARDING DOCUMENT
    ==========================================
    */

    if(
        mongoose.models.Onboarding
    ){

        onboarding =
            await Onboarding.findOne({

                school: schoolId

            })
            .lean();

    }



    return {

        success:true,


        school,


        onboarding:{

            status:
                onboarding?.status ||
                "not_started",


            progress:
                onboarding?.progress ??
                school.onboardingPercentage ??
                0,


            currentStep:
                onboarding?.currentStep ||
                school.currentSetupStep ||
                ONBOARDING_STEPS.SCHOOL_PROFILE,


            completedSteps:
                onboarding?.completedSteps ||
                [],


            completed:
                school.onboardingCompleted ||
                false

        }

    };

};

// ============================================================
// UTILITY
// CHECK WHETHER PROFILE EXISTS
// ============================================================

export const schoolProfileExists = async (

    schoolId

) => {

    if (

        !mongoose.Types.ObjectId.isValid(
            schoolId
        )

    ) {

        return false;

    }

    const school =

        await School.exists({

            _id: schoolId

        });

    return Boolean(school);

};



// ============================================================
// UTILITY
// GET SCHOOL BY SLUG
// ============================================================

export const getSchoolBySlug = async (

    slug

) => {

    return await School.findOne({

        slug:
            generateSlug(slug)

    });

};



// ============================================================
// UTILITY
// GET SCHOOL BY CODE
// ============================================================

export const getSchoolByCode = async (

    code

) => {

    return await School.findOne({

        code:
            code
                .trim()
                .toUpperCase()

    });

};



// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {

    createSchoolProfile,

    updateSchoolProfile,

    setupSchoolProfile,

    getSchoolProfile,

    getOnboardingStatus,

    schoolProfileExists,

    getSchoolBySlug,

    getSchoolByCode

};