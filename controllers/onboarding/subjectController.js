// ============================================================
// backend/controllers/onboarding/subjectController.js
// Subjects - school scoped CRUD
//
// Subjects belong to the SCHOOL (they are attached to classes
// later), so a class is not required to create one.
// ============================================================

import Subject from "../../models/Subject.js";
import { schoolIdOf, ok, fail, handleError, idOrNull } from "./_shared.js";

const LABEL = "Subject";
const CATEGORIES = ["core", "elective", "vocational", "religious", "language", "practical", "other"];

const makeCode = async (school, name) => {
    const base =
        String(name).replace(/[^A-Za-z0-9]/g, "").substring(0, 3).toUpperCase() || "SUB";
    let code = base;
    let n = 1;
    while (await Subject.exists({ school, code })) {
        n += 1;
        code = `${base}${n}`;
    }
    return code;
};

const categoryOf = (b, fallback = "core") => {
    if (CATEGORIES.includes(String(b.category || "").toLowerCase())) {
        return String(b.category).toLowerCase();
    }
    if (b.isCompulsory === true) return "core";
    if (b.isCompulsory === false && b.category === undefined) return "elective";
    return fallback;
};

export const createSubject = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const b = req.body || {};
        if (!String(b.name || "").trim()) return fail(res, "Subject name is required.");

        const created = await Subject.create({
            school,
            name: b.name.trim(),
            code: b.code?.trim()?.toUpperCase() || (await makeCode(school, b.name)),
            shortName: b.shortName || "",
            department: idOrNull(b.department),
            category: categoryOf(b, "core"),
            description: b.description || "",
            createdBy: req.user?._id,
        });

        return ok(res, "Subject created successfully.", await Subject.findById(created._id).populate("department", "name"), 201);
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const getSubjects = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const filter = { school, isDeleted: { $ne: true } };
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.department) filter.department = req.query.department;
        if (req.query.search) filter.name = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

        const data = await Subject.find(filter).populate("department", "name").sort({ name: 1 });
        return ok(res, "Subjects fetched.", data, 200, { count: data.length });
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const getSubject = async (req, res) => {
    try {
        const item = await Subject.findOne({ _id: req.params.id, school: schoolIdOf(req), isDeleted: { $ne: true } }).populate("department", "name");
        if (!item) return fail(res, "Subject not found.", 404);
        return ok(res, "Subject fetched.", item);
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const updateSubject = async (req, res) => {
    try {
        const item = await Subject.findOne({ _id: req.params.id, school: schoolIdOf(req), isDeleted: { $ne: true } });
        if (!item) return fail(res, "Subject not found.", 404);

        const b = req.body || {};
        if (b.name !== undefined) {
            if (!String(b.name).trim()) return fail(res, "Subject name is required.");
            item.name = b.name.trim();
        }
        if (b.code) item.code = b.code.trim().toUpperCase();
        if (b.shortName !== undefined) item.shortName = b.shortName;
        if (b.description !== undefined) item.description = b.description;
        if (b.department !== undefined) item.department = idOrNull(b.department);
        if (b.status !== undefined) item.status = b.status;
        if (b.category !== undefined || b.isCompulsory !== undefined) {
            item.category = categoryOf(b, item.category);
        }
        item.updatedBy = req.user?._id;
        await item.save();

        return ok(res, "Subject updated successfully.", await Subject.findById(item._id).populate("department", "name"));
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const item = await Subject.findOne({ _id: req.params.id, school: schoolIdOf(req), isDeleted: { $ne: true } });
        if (!item) return fail(res, "Subject not found.", 404);
        await Subject.deleteOne({ _id: item._id });
        return ok(res, "Subject deleted successfully.");
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};
