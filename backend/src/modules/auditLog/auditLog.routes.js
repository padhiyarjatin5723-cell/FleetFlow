import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  createAuditLog,
  getAuditLogs,
  getAuditLogById,
  updateAuditLog,
  deleteAuditLog,
} from "./auditLog.controller.js";

import {
  createAuditLogSchema,
  updateAuditLogSchema,
} from "./auditLog.validator.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(createAuditLogSchema),
  createAuditLog
);

router.get("/", getAuditLogs);

router.get("/:id", getAuditLogById);

router.put(
  "/:id",
  validate(updateAuditLogSchema),
  updateAuditLog
);

router.delete("/:id", deleteAuditLog);

export default router;