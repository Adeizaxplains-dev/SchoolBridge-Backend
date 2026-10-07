import express from "express";



import {
  createFee,
  getFees,
  getFee,
  makePayment,
  getDefaulters,
  getFeeStats,

} from "../controllers/feeController.js";



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
FEE MODULE SECURITY

Requires:

1. Authentication
2. School ownership verification

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

POST /api/fees


Example:

- Tuition fee
- Boarding fee
- Examination fee
- Transport fee


Allowed:

admin only


==================================================
*/


router.post(
  "/",
  roleGuard(
    "admin"
  ),
  createFee
);









/*
==================================================
GET ALL FEES

GET /api/fees


Used by:

Admin finance dashboard


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
  getFees
);









/*
==================================================
FEE STATISTICS

GET /api/fees/stats


Dashboard:

- total expected
- total paid
- outstanding
- collection rate


Allowed:

admin
principal


==================================================
*/


router.get(
  "/stats",
  roleGuard(
    "admin",
    "principal"
  ),
  getFeeStats
);









/*
==================================================
FEE DEFAULTERS

GET /api/fees/defaulters


Allowed:

admin
principal


==================================================
*/


router.get(
  "/defaulters",
  roleGuard(
    "admin",
    "principal"
  ),
  getDefaulters
);









/*
==================================================
GET SINGLE FEE

GET /api/fees/:id


Allowed:

admin
principal
parent


==================================================
*/


router.get(
  "/:id",
  roleGuard(
    "admin",
    "principal",
    "parent"
  ),
  getFee
);









/*
==================================================
MAKE PAYMENT

POST /api/fees/:id/pay


Allowed:

admin
parent


Future:

- Paystack
- Flutterwave
- Bank transfer verification


==================================================
*/


router.post(
  "/:id/pay",
  roleGuard(
    "admin",
    "parent"
  ),
  makePayment
);









export default router;