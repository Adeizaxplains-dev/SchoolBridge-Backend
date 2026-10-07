import express from "express";

import {
  parentLogin,
} from "../controllers/parentAuthController.js";

const router = express.Router();

router.post(
  "/login",
  parentLogin
);

export default router;