import express from "express";



import {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,

} from "../controllers/feeStructureController.js";



import {
  authMiddleware,
} from "../middleware/authMiddleware.js";



import {
  schoolMiddleware,
} from "../middleware/schoolMiddleware.js";



import {
  roleGuard,
} from "../middleware/roleGuard.js";





const router = express.Router();









/*
==================================================
FEE STRUCTURE SECURITY

Every request requires:

1. Authentication
2. School tenant verification

==================================================
*/


router.use(
  authMiddleware
);


router.use(
  schoolMiddleware
);









/*
==================================================
CREATE FEE STRUCTURE

POST /api/fee-structures


Used during:

Onboarding
School Setup
Finance Configuration


Allowed:

admin only


==================================================
*/


router.post(
  "/",
  roleGuard(
    "admin"
  ),
  createFeeStructure
);









/*
==================================================
GET ALL FEE STRUCTURES

GET /api/fee-structures


Used by:

- Fee setup page
- Finance dashboard
- Onboarding summary


Allowed:

admin
principal


==================================================
*/


router.get(
  "/",
  roleGuard(
    "admin",
    "principal"
  ),
  getFeeStructures
);









/*
==================================================
GET SINGLE FEE STRUCTURE

GET /api/fee-structures/:id


Allowed:

admin
principal


==================================================
*/


router.get(
  "/:id",
  roleGuard(
    "admin",
    "principal"
  ),
  getFeeStructure
);









/*
==================================================
UPDATE FEE STRUCTURE

PUT /api/fee-structures/:id


Allowed:

admin only


==================================================
*/


router.put(
  "/:id",
  roleGuard(
    "admin"
  ),
  updateFeeStructure
);









/*
==================================================
DELETE FEE STRUCTURE

DELETE /api/fee-structures/:id


Allowed:

admin only


==================================================
*/


router.delete(
  "/:id",
  roleGuard(
    "admin"
  ),
  deleteFeeStructure
);









export default router;