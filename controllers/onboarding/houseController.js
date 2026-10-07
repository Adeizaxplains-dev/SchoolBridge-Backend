// ============================================================
// SchoolBridge Enterprise
// House Controller
// ============================================================

import * as houseService from "../../services/onboarding/houseService.js";

/*
============================================================
CREATE HOUSES (ONBOARDING)
POST /onboarding/houses
============================================================
*/

export const saveHouses = async (req, res, next) => {
    try {

        const schoolId =
            req.school?._id || req.schoolId;

        const houses =
            req.body.houses || req.body;

        const data =
            await houseService.setupHouses(
                schoolId,
                houses
            );

        res.status(201).json({
            success: true,
            message: "Houses saved successfully.",
            data
        });

    } catch (error) {
        next(error);
    }
};

/*
============================================================
GET ALL HOUSES
GET /school-setup/houses
============================================================
*/

export const getHouses = async (req, res, next) => {
    try {

        const schoolId =
            req.school?._id || req.schoolId;

        const houses =
            await houseService.getHouses(
                schoolId
            );

        res.json({
            success: true,
            data: houses
        });

    } catch (error) {
        next(error);
    }
};

/*
============================================================
GET SINGLE HOUSE
GET /school-setup/houses/:id
============================================================
*/

export const getHouse = async (req, res, next) => {
    try {

        const house =
            await houseService.getHouse(
                req.params.id
            );

        res.json({
            success: true,
            data: house
        });

    } catch (error) {
        next(error);
    }
};

/*
============================================================
CREATE HOUSE
POST /school-setup/houses
============================================================
*/

export const createHouse = async (req, res, next) => {
    try {

        const schoolId =
            req.school?._id || req.schoolId;

        const houses =
            await houseService.createHouses(
                schoolId,
                [req.body]
            );

        res.status(201).json({
            success: true,
            message: "House created successfully.",
            data: houses[0]
        });

    } catch (error) {
        next(error);
    }
};

/*
============================================================
UPDATE HOUSE
PUT /school-setup/houses/:id
============================================================
*/

export const updateHouse = async (req, res, next) => {
    try {

        const house =
            await houseService.updateHouse(
                req.params.id,
                req.body
            );

        res.json({
            success: true,
            message: "House updated successfully.",
            data: house
        });

    } catch (error) {
        next(error);
    }
};

/*
============================================================
DELETE HOUSE
DELETE /school-setup/houses/:id
============================================================
*/

export const deleteHouse = async (req, res, next) => {
    try {

        const result =
            await houseService.deleteHouse(
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
    saveHouses,
    getHouses,
    getHouse,
    createHouse,
    updateHouse,
    deleteHouse
};