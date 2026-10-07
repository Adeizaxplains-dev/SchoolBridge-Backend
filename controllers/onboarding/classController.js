// ============================================================
// backend/controllers/onboarding/classController.js
// Classes - school scoped CRUD
//
// The model requires an academic session and a NUMERIC level.
// Both are resolved here so simple forms ({ name, level, arm })
// work: the session defaults to the school's current session and
// the level is parsed from the value or the class name ("JSS 2" -> 2).
// ============================================================

import Class from "../../models/Class.js";
import ClassArm from "../../models/ClassArm.js";
import AcademicSession from "../../models/AcademicSession.js";
import { schoolIdOf, ok, fail, handleError, idOrNull } from "./_shared.js";

const LABEL = "Class";

const resolveSession = async (school, requested) => {
    if (requested) {
        const found = await AcademicSession.findOne({
            _id: requested,
            school,
            isDeleted: { $ne: true },
        });
        if (found) return found._id;
    }
    const current =
        (await AcademicSession.findOne({ school, isCurrent: true, isDeleted: { $ne: true } })) ||
        (await AcademicSession.findOne({ school, isDeleted: { $ne: true } }).sort({ startDate: -1 }));
    return current?._id || null;
};

const parseLevel = (level, name) => {
    const direct = Number(level);
    if (level !== "" && level !== null && level !== undefined && Number.isFinite(direct)) {
        return direct;
    }
    const fromText = String(level || "").match(/\d+/) || String(name || "").match(/\d+/);
    return fromText ? Number(fromText[0]) : 1;
};

const populateClass = (q) =>
    q.populate("academicSession", "name isCurrent").populate("department", "name");

export const createClass = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const b = req.body || {};

        if (!String(b.name || "").trim()) return fail(res, "Class name is required.");

        const academicSession = await resolveSession(school, b.academicSession);
        if (!academicSession) {
            return fail(res, "Create an academic session before adding classes.");
        }

        const created = await Class.create({
            school,
            academicSession,
            name: b.name.trim(),
            code: b.code?.trim() || undefined,
            level: parseLevel(b.level, b.name),
            arm: String(b.arm || "").trim(),
            department: idOrNull(b.department),
            classTeacher: idOrNull(b.classTeacher),
            capacity: Number(b.capacity) > 0 ? Number(b.capacity) : 40,
            description: b.description || "",
            createdBy: req.user?._id,
        });

        return ok(res, "Class created successfully.", await populateClass(Class.findById(created._id)), 201);
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const getClasses = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const filter = { school, isDeleted: { $ne: true } };
        if (req.query.academicSession) filter.academicSession = req.query.academicSession;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.search) filter.name = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

        const data = await populateClass(Class.find(filter).sort({ level: 1, name: 1, arm: 1 }));
        return ok(res, "Classes fetched.", data, 200, { count: data.length });
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const getClass = async (req, res) => {
    try {
        const item = await populateClass(
            Class.findOne({ _id: req.params.id, school: schoolIdOf(req), isDeleted: { $ne: true } })
        );
        if (!item) return fail(res, "Class not found.", 404);
        return ok(res, "Class fetched.", item);
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const updateClass = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const item = await Class.findOne({ _id: req.params.id, school, isDeleted: { $ne: true } });
        if (!item) return fail(res, "Class not found.", 404);

        const b = req.body || {};
        if (b.name !== undefined) {
            if (!String(b.name).trim()) return fail(res, "Class name is required.");
            item.name = b.name.trim();
        }
        if (b.level !== undefined) item.level = parseLevel(b.level, item.name);
        if (b.arm !== undefined) item.arm = String(b.arm || "").trim();
        if (b.description !== undefined) item.description = b.description;
        if (b.capacity !== undefined && Number(b.capacity) > 0) item.capacity = Number(b.capacity);
        if (b.status !== undefined) item.status = b.status;
        if (b.department !== undefined) item.department = idOrNull(b.department);
        if (b.classTeacher !== undefined) item.classTeacher = idOrNull(b.classTeacher);
        if (b.academicSession) {
            item.academicSession = (await resolveSession(school, b.academicSession)) || item.academicSession;
        }
        item.updatedBy = req.user?._id;
        await item.save();

        return ok(res, "Class updated successfully.", await populateClass(Class.findById(item._id)));
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};

export const deleteClass = async (req, res) => {
    try {
        const school = schoolIdOf(req);
        const item = await Class.findOne({ _id: req.params.id, school, isDeleted: { $ne: true } });
        if (!item) return fail(res, "Class not found.", 404);

        if (item.currentStudents > 0) {
            return fail(res, "This class still has students. Move them first.", 409);
        }

        await ClassArm.deleteMany({ school, class: item._id });
        await Class.deleteOne({ _id: item._id });
        return ok(res, "Class deleted successfully.");
    } catch (error) {
        return handleError(res, error, LABEL);
    }
};
