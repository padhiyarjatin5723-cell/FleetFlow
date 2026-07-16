import maintenanceService from "./maintenance.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { writeAuditLog } from "../../utils/audit.js";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  completeMaintenanceSchema,
} from "./maintenance.validator.js";

export const createMaintenance = asyncHandler(async (req, res) => {
  const data = createMaintenanceSchema.parse(req.body);
  const maintenance = await maintenanceService.createMaintenance(data);
  await writeAuditLog({
    userId: req.user?.id,
    action: "MAINTENANCE_CREATED",
    entityType: "Maintenance",
    entityId: maintenance.id,
    newData: maintenance,
    ipAddress: req.ip,
  });

  return res.status(201).json(
    new ApiResponse(201, "Maintenance created successfully", maintenance)
  );
});

export const getAllMaintenances = asyncHandler(async (req, res) => {
  const maintenances = await maintenanceService.getAllMaintenances();

  return res.status(200).json(
    new ApiResponse(200, "Maintenance records fetched successfully", maintenances)
  );
});

export const getMaintenanceById = asyncHandler(async (req, res) => {
  const maintenance = await maintenanceService.getMaintenanceById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, "Maintenance fetched successfully", maintenance)
  );
});

export const updateMaintenance = asyncHandler(async (req, res) => {
  const data = updateMaintenanceSchema.parse(req.body);
  const oldMaintenance = await maintenanceService.getMaintenanceById(req.params.id);
  const maintenance = await maintenanceService.updateMaintenance(
    req.params.id,
    data
  );
  await writeAuditLog({
    userId: req.user?.id,
    action: "MAINTENANCE_UPDATED",
    entityType: "Maintenance",
    entityId: maintenance.id,
    oldData: oldMaintenance,
    newData: maintenance,
    ipAddress: req.ip,
  });

  return res.status(200).json(
    new ApiResponse(200, "Maintenance updated successfully", maintenance)
  );
});

export const completeMaintenance = asyncHandler(async (req, res) => {
  const data = completeMaintenanceSchema.parse(req.body);
  const oldMaintenance = await maintenanceService.getMaintenanceById(req.params.id);
  const maintenance = await maintenanceService.completeMaintenance(
    req.params.id,
    data
  );
  await writeAuditLog({
    userId: req.user?.id,
    action: "MAINTENANCE_COMPLETED",
    entityType: "Maintenance",
    entityId: maintenance.id,
    oldData: oldMaintenance,
    newData: maintenance,
    ipAddress: req.ip,
  });

  return res.status(200).json(
    new ApiResponse(200, "Maintenance completed successfully", maintenance)
  );
});

export const deleteMaintenance = asyncHandler(async (req, res) => {
  const result = await maintenanceService.deleteMaintenance(req.params.id);
  await writeAuditLog({
    userId: req.user?.id,
    action: "MAINTENANCE_DELETED",
    entityType: "Maintenance",
    entityId: req.params.id,
    ipAddress: req.ip,
  });

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});
