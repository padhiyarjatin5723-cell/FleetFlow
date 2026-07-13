import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import {
  createDriver,
  getAllDrivers,
  getAvailableDrivers,
  getDriverById,
  getDriverTrips,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
} from "./driver.controller.js";

const router = Router();

router.post("/", authMiddleware, roleMiddleware("ADMIN"), createDriver);

router.get("/", authMiddleware, getAllDrivers);
router.get("/available", authMiddleware, getAvailableDrivers);
router.get("/:id/trips", authMiddleware, getDriverTrips);
router.get("/:id", authMiddleware, getDriverById);

router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateDriver);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateDriverStatus
);

router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteDriver);

export default router;
