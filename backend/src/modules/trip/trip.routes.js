import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import {
  createTrip,
  getAllTrips,
  getCompletedTrips,
  getTripById,
  updateTrip,
  updateTripStatus,
  deleteTrip,
} from "./trip.controller.js";

const router = Router();
const tripManagers = ["ADMIN", "FLEET_MANAGER", "DISPATCHER"];

router.post("/", authMiddleware, roleMiddleware(...tripManagers), createTrip);

router.get("/", authMiddleware, getAllTrips);
router.get("/completed", authMiddleware, getCompletedTrips);
router.get("/:id", authMiddleware, getTripById);

router.put("/:id", authMiddleware, roleMiddleware(...tripManagers), updateTrip);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(...tripManagers),
  updateTripStatus
);

router.delete("/:id", authMiddleware, roleMiddleware(...tripManagers), deleteTrip);

export default router;
