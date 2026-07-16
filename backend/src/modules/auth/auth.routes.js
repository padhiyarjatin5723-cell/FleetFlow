import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";

import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
} from "./auth.controller.js";

const router = Router();

router.get("/roles", getRoles);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware, logout);
router.post("/logout-all", authMiddleware, logoutAll);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);

router.get("/me", authMiddleware, me);

export default router;
