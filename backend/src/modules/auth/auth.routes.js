import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";

import {
  register,
  login,
  logout,
  logoutAll,
  me,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);

router.get("/me", authMiddleware, me);

export default router;