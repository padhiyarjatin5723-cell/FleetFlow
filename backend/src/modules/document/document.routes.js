import { Router } from "express";

import * as controller from "./document.controller.js";

import validate from "../../middleware/validate.middleware.js";
import {
  createDocumentSchema,
  updateDocumentSchema,
  idParamSchema,
} from "./document.validator.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

const router = Router();
const documentManagers = ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"];

router.use(authMiddleware);

router.post(
  "/",
  roleMiddleware(...documentManagers),
  validate(createDocumentSchema),
  controller.createDocument
);

router.get("/", controller.getAllDocuments);

router.get(
  "/:id",
  validate(idParamSchema),
  controller.getDocumentById
);

router.put(
  "/:id",
  validate(idParamSchema),
  roleMiddleware(...documentManagers),
  validate(updateDocumentSchema),
  controller.updateDocument
);

router.delete(
  "/:id",
  validate(idParamSchema),
  roleMiddleware(...documentManagers),
  controller.deleteDocument
);

export default router;
