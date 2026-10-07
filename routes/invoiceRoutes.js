import express from "express";

import {
createInvoice,
getInvoices,
getInvoiceById,
updateInvoice,
deleteInvoice,
} from "../controllers/invoiceController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { schoolMiddleware } from "../middleware/schoolMiddleware.js";

const router = express.Router();

/*

PROTECTED ROUTES

*/
router.use(authMiddleware);
router.use(schoolMiddleware);

/*

CREATE INVOICE
POST /api/invoices
==================

*/
router.post("/", createInvoice);

/*

GET ALL INVOICES
GET /api/invoices
=================

*/
router.get("/", getInvoices);

/*

GET SINGLE INVOICE
GET /api/invoices/:id
=====================

*/
router.get("/:id", getInvoiceById);

/*

UPDATE INVOICE
PUT /api/invoices/:id
=====================

*/
router.put("/:id", updateInvoice);

/*

DELETE INVOICE
DELETE /api/invoices/:id
========================

*/
router.delete("/:id", deleteInvoice);

export default router;
