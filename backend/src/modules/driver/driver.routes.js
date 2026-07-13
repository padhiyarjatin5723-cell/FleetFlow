import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "./driver.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createDriver
);

router.get(
  "/",
  authMiddleware,
  getAllDrivers
);

router.get(
  "/:id",
  authMiddleware,
  getDriverById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateDriver
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteDriver
);

export default router;