import express from "express";


import {
  createParent,
  getParents,
  getParent,
  updateParent,
  deleteParent,
  getParentStats,

} from "../controllers/parentController.js";



import {
  authMiddleware,
} from "../middleware/authMiddleware.js";


import {
  roleGuard,
} from "../middleware/roleGuard.js";


import {
  schoolMiddleware,
} from "../middleware/schoolMiddleware.js";



const router = express.Router();






/*
==================================================
PARENT ROUTES
==================================================

All routes require:

1. Authentication
2. School isolation
3. Role permission

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
PARENT STATISTICS

GET /api/parents/stats

Dashboard analytics

Allowed:
- admin
- principal

==================================================
*/


router.get(
  "/stats",
  roleGuard(
    "admin",
    "principal"
  ),
  getParentStats
);








/*
==================================================
GET ALL PARENTS

GET /api/parents


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
  getParents
);








/*
==================================================
GET SINGLE PARENT

GET /api/parents/:id


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
  getParent
);








/*
==================================================
CREATE PARENT

POST /api/parents


Allowed:

admin

==================================================
*/


router.post(
  "/",
  roleGuard(
    "admin"
  ),
  createParent
);








/*
==================================================
UPDATE PARENT

PUT /api/parents/:id


Allowed:

admin

==================================================
*/


router.put(
  "/:id",
  roleGuard(
    "admin"
  ),
  updateParent
);








/*
==================================================
DELETE PARENT

DELETE /api/parents/:id


Allowed:

admin

==================================================
*/


router.delete(
  "/:id",
  roleGuard(
    "admin"
  ),
  deleteParent
);







export default router;