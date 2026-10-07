// ============================================================
// backend/controllers/onboarding/academicSessionController.js
// Academic sessions - school scoped CRUD
// ============================================================

import AcademicSession from "../../models/AcademicSession.js";
import Term from "../../models/Term.js";
import Class from "../../models/Class.js";
import School from "../../models/School.js";
import { schoolIdOf, ok, fail, handleError } from "./_shared.js";

const LABEL = "Academic session";

const validate = (b, partial = false) => {
    const errors = [];
    if (!partial || b.name !== undefined) {
        if (!String(b.name || "").trim()) errors.push("Session name is required.");
    }
    if (!partial) {
        if (!b.startDate) errors.push("Start date is required.");
        if (!b.endDate) errors.push("End date is required.");
    }
    if (b.startDate && b.endDate && new Date(b.startDate) >= new Date(b.endDate)) {
        errors.push("End date must be later than start date.");
    }
    return errors;
};

const makeCurrent = async (schoolId, sessionId) => {
    await AcademicSession.updateMany(
        { school: schoolId, _id: { $ne: sessionId }, isCurrent: true },
        { $set: { isCurrent: false, status: "completed" } }
    );
    await AcademicSession.findByIdAndUpdate(sessionId, {
        $set: { isCurrent: true, status: "active" },
    });
    await School.findByIdAndUpdate(schoolId, {
        $set: { currentAcademicSession: sessionId },
    });
};

export const createAcademicSession = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const errors = validate(req.body);
        if (errors.length) return fail(res, errors.join(" "));

        const { name, code, startDate, endDate, description } = req.body;

        const hasAny = await AcademicSession.exists({
            school,
            isDeleted: { $ne: true },
        });
        // first session is automatically the current one
        const isCurrent = req.body.isCurrent === true || !hasAny;

        const created = await AcademicSession.create({
            school,
            name: name.trim(),
            code: code?.trim() || undefined,
            startDate,
            endDate,
            description: description || "",
            isCurrent: false,
            status: "upcoming",
            createdBy: req.user?._id,
        });

        if (isCurrent) await makeCurrent(school, created._id);

        const fresh = await AcademicSession.findById(created._id);
        return ok(res, "Academic session created successfully.", fresh, 201);
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const getAcademicSessions = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const filter = { school, isDeleted: { $ne: true } };
        if (req.query.status) filter.status = req.query.status;

        const data = await AcademicSession.find(filter).sort({ startDate: -1 });
        return ok(res, "Academic sessions fetched.", data, 200, {
            count: data.length,
        });
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const getCurrentSession = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const current =
            (await AcademicSession.findOne({
                school,
                isCurrent: true,
                isDeleted: { $ne: true },
            })) ||
            (await AcademicSession.findOne({
                school,
                isDeleted: { $ne: true },
            }).sort({ startDate: -1 }));

        if (!current) return fail(res, "No academic session found.", 404);
        return ok(res, "Current academic session fetched.", current);
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const getAcademicSession = async (req, res) => {
    try {
        const item = await AcademicSession.findOne({
            _id: req.params.id,
            school: schoolIdOf(req),
            isDeleted: { $ne: true },
        });
        if (!item) return fail(res, "Academic session not found.", 404);
        return ok(res, "Academic session fetched.", item);
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const updateAcademicSession = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const item = await AcademicSession.findOne({
            _id: req.params.id,
            school,
            isDeleted: { $ne: true },
        });
        if (!item) return fail(res, "Academic session not found.", 404);

        const merged = { ...item.toObject(), ...req.body };
        const errors = validate(merged, true);
        if (errors.length) return fail(res, errors.join(" "));

        ["name", "code", "startDate", "endDate", "description", "status"].forEach(
            (key) => {
                if (req.body[key] !== undefined) item[key] = req.body[key];
            }
        );
        item.updatedBy = req.user?._id;
        await item.save();

        if (req.body.isCurrent === true) await makeCurrent(school, item._id);

        return ok(
            res,
            "Academic session updated successfully.",
            await AcademicSession.findById(item._id)
        );
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const deleteAcademicSession = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const item = await AcademicSession.findOne({
            _id: req.params.id,
            school,
            isDeleted: { $ne: true },
        });
        if (!item) return fail(res, "Academic session not found.", 404);

        const [terms, classes] = await Promise.all([
            Term.countDocuments({ school, academicSession: item._id, isDeleted: { $ne: true } }),
            Class.countDocuments({ school, academicSession: item._id, isDeleted: { $ne: true } }),
        ]);
        if (terms || classes) {
            return fail(
                res,
                "This session still has terms or classes. Remove them first.",
                409
            );
        }

        await AcademicSession.deleteOne({ _id: item._id });
        if (item.isCurrent) {
            await School.findByIdAndUpdate(school, {
                $set: { currentAcademicSession: null },
            });
        }
        return ok(res, "Academic session deleted successfully.");
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};
