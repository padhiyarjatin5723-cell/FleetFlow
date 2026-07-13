import { Router } from "express";

import * as controller from "./document.controller.js";

import validate from "../../middleware/validate.middleware.js";
import {
  createDocumentSchema,
  updateDocumentSchema,
  idParamSchema,
} from "./document.validator.js";

import authMiddleware from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
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
  validate(updateDocumentSchema),
  controller.updateDocument
);

router.delete(
  "/:id",
  validate(idParamSchema),
  controller.deleteDocument
);

export default router;