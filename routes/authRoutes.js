import express from "express";

import {
  registerSchool,
  loginUser,
  getProfile,
  logoutUser
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
==================================
PUBLIC ROUTES
==================================
*/

/*
CREATE SCHOOL ACCOUNT
POST /api/auth/register
*/
router.post("/register", registerSchool);

/*
LOGIN
POST /api/auth/login
*/
router.post("/login", loginUser);

/*
==================================
PROTECTED ROUTES
==================================
*/

/*
CURRENT USER PROFILE
GET /api/auth/profile
*/
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

/*
LOGOUT
POST /api/auth/logout
*/
router.post(
  "/logout",
  authMiddleware,
  logoutUser
);

export default router;