// ============================================================
// backend/utils/transaction.js
// SchoolBridge - optional MongoDB transactions
//
// MongoDB transactions only work on replica sets / sharded
// clusters (MongoDB Atlas, Render + Atlas, etc). A plain local
// standalone `mongod` rejects them with:
//   "Transaction numbers are only allowed on a replica set member"
//
// runInTransaction() uses a real transaction when the server
// supports it and otherwise just runs the work without one, so the
// same code works in production (Atlas) and in local development.
//
// Usage:
//   const result = await runInTransaction(async (session) => {
//       const [school] = await School.create([data], sessionOpts(session));
//       return school;
//   });
// ============================================================

import mongoose from "mongoose";

let supported = null;

export const transactionsSupported = async () => {
    if (supported !== null) {
        return supported;
    }

    try {
        const info = await mongoose.connection.db
            .admin()
            .command({ hello: 1 });

        supported =
            Boolean(info.setName) ||
            info.msg === "isdbgrid";
    } catch {
        supported = false;
    }

    return supported;
};

// Options object for create()/save() calls: { session } or {}.
export const sessionOpts = (session) =>
    session ? { session } : {};

// Apply a session to a query only when one exists.
export const withSession = (query, session) =>
    session ? query.session(session) : query;

export const runInTransaction = async (work) => {
    if (!(await transactionsSupported())) {
        return work(null);
    }

    const session = await mongoose.startSession();

    try {
        let result;

        await session.withTransaction(async () => {
            result = await work(session);
        });

        return result;
    } finally {
        await session.endSession();
    }
};

export default runInTransaction;
