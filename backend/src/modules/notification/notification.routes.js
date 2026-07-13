import { Router } from "express";
import * as notificationController from "./notification.controller.js";
import validate from "../../middleware/validate.middleware.js";
import {
  createNotificationSchema,
  updateNotificationSchema,
} from "./notification.validator.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createNotificationSchema),
  notificationController.createNotification
);

router.get("/", notificationController.getNotifications);

router.get("/:id", notificationController.getNotificationById);

router.put(
  "/:id",
  validate(updateNotificationSchema),
  notificationController.updateNotification
);

router.delete("/:id", notificationController.deleteNotification);

export default router;