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

router.post("/", authMiddleware, roleMiddleware("ADMIN"), createTrip);

router.get("/", authMiddleware, getAllTrips);
router.get("/completed", authMiddleware, getCompletedTrips);
router.get("/:id", authMiddleware, getTripById);

router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateTrip);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateTripStatus
);

router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteTrip);

export default router;
