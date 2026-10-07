import express from "express";

import {
  createGradingSystem,
  getGradingSystems,
  getGradingSystem,
  updateGradingSystem,
  deleteGradingSystem,
  setCurrentGradingSystem,
} from "../controllers/gradingSystemController.js";


import {
  authMiddleware,
  adminOnly,
} from "../middleware/authMiddleware.js";


import { schoolMiddleware } from "../middleware/schoolMiddleware.js";



const router = express.Router();



/*
====================================================
ALL GRADING SYSTEM ROUTES
REQUIRE:
- Authentication
- Admin permission
- School isolation
====================================================
*/


router.use(
  authMiddleware
);


router.use(
  adminOnly
);


router.use(
  schoolMiddleware
);




/*
====================================================
CREATE GRADING SYSTEM

POST
/api/grading-system

Used during onboarding
====================================================
*/

router.post(
  "/",
  createGradingSystem
);





/*
====================================================
GET ALL GRADING SYSTEMS

GET
/api/grading-system

Admin dashboard
====================================================
*/

router.get(
  "/",
  getGradingSystems
);





/*
====================================================
GET SINGLE GRADING SYSTEM

GET
/api/grading-system/:id
====================================================
*/

router.get(
  "/:id",
  getGradingSystem
);





/*
====================================================
UPDATE GRADING SYSTEM

PUT
/api/grading-system/:id
====================================================
*/

router.put(
  "/:id",
  updateGradingSystem
);





/*
====================================================
DELETE GRADING SYSTEM

DELETE
/api/grading-system/:id
====================================================
*/

router.delete(
  "/:id",
  deleteGradingSystem
);





router.patch("/:id/current", setCurrentGradingSystem);

export default router;