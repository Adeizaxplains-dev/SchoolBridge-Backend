// ============================================================
// SchoolBridge Enterprise
// Class Arm Controller
// ============================================================

import * as classArmService from "../../services/onboarding/classArmService.js";

/*
============================================================
ONBOARDING
POST /onboarding/arms
============================================================
*/

export const saveClassArms = async (req, res, next) => {
    try {

        const schoolId =
            req.school?._id || req.schoolId;

        const arms =
            req.body.arms || req.body;

        const data =
            await classArmService.setupClassArms(
                schoolId,
                arms
            );

        res.status(201).json({
            success: true,
            message: "Class arms saved successfully.",
            data
        });

    } catch (error) {
        next(error);
    }
};


/*
============================================================
GET ALL
GET /school-setup/arms
============================================================
*/

export const getClassArms = async (req, res, next) => {
    try {

        const schoolId =
            req.school?._id || req.schoolId;

        const arms =
            await classArmService.getClassArms(
                schoolId
            );

        res.json({
            success: true,
            data: arms
        });

    } catch (error) {
        next(error);
    }
};


/*
============================================================
GET ONE
GET /school-setup/arms/:id
============================================================
*/

export const getClassArm = async (req, res, next) => {
    try {

        const arm =
            await classArmService.getClassArm(
                req.params.id
            );

        res.json({
            success: true,
            data: arm
        });

    } catch (error) {
        next(error);
    }
};


/*
============================================================
CREATE
POST /school-setup/arms
============================================================
*/

export const createClassArm = async (req, res, next) => {
    try {

        const schoolId =
            req.school?._id || req.schoolId;

        const created =
            await classArmService.createClassArms(
                schoolId,
                [req.body]
            );

        res.status(201).json({
            success: true,
            message: "Class arm created successfully.",
            data: created[0]
        });

    } catch (error) {
        next(error);
    }
};


/*
============================================================
UPDATE
PUT /school-setup/arms/:id
============================================================
*/

export const updateClassArm = async (req, res, next) => {
    try {

        const arm =
            await classArmService.updateClassArm(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            message: "Class arm updated successfully.",
            data: arm
        });

    } catch (error) {
        next(error);
    }
};


/*
============================================================
DELETE
DELETE /school-setup/arms/:id
============================================================
*/

export const deleteClassArm = async (req, res, next) => {
    try {

        const result =
            await classArmService.deleteClassArm(
                req.params.id
            );

        res.json(result);

    } catch (error) {
        next(error);
    }
};


/*
============================================================
DEFAULT EXPORT
============================================================
*/

export default {

    saveClassArms,

    getClassArms,

    getClassArm,

    createClassArm,

    updateClassArm,

    deleteClassArm

};