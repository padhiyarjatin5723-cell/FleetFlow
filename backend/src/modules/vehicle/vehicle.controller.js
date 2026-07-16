import vehicleService from "./vehicle.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { writeAuditLog } from "../../utils/audit.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "./vehicle.validator.js";

export const createVehicle = asyncHandler(async (req, res) => {
  const data = createVehicleSchema.parse(req.body);
  const vehicle = await vehicleService.createVehicle(data);
  await writeAuditLog({
    userId: req.user?.id,
    action: "VEHICLE_CREATED",
    entityType: "Vehicle",
    entityId: vehicle.id,
    newData: vehicle,
    ipAddress: req.ip,
  });

  return res.status(201).json(
    new ApiResponse(201, "Vehicle created successfully", vehicle)
  );
});

export const getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getAllVehicles(req.query);

  return res.status(200).json(
    new ApiResponse(200, "Vehicles fetched successfully", vehicles)
  );
});

export const getAvailableVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getAvailableVehicles();

  return res.status(200).json(
    new ApiResponse(200, "Available vehicles fetched successfully", vehicles)
  );
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, "Vehicle fetched successfully", vehicle)
  );
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const data = updateVehicleSchema.parse(req.body);
  const oldVehicle = await vehicleService.getVehicleById(req.params.id);
  const vehicle = await vehicleService.updateVehicle(req.params.id, data);
  await writeAuditLog({
    userId: req.user?.id,
    action: "VEHICLE_UPDATED",
    entityType: "Vehicle",
    entityId: vehicle.id,
    oldData: oldVehicle,
    newData: vehicle,
    ipAddress: req.ip,
  });

  return res.status(200).json(
    new ApiResponse(200, "Vehicle updated successfully", vehicle)
  );
});

export const updateVehicleStatus = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicleStatus(
    req.params.id,
    req.body.status
  );
  await writeAuditLog({
    userId: req.user?.id,
    action: "VEHICLE_STATUS_UPDATED",
    entityType: "Vehicle",
    entityId: vehicle.id,
    newData: vehicle,
    ipAddress: req.ip,
  });

  return res.status(200).json(
    new ApiResponse(200, "Vehicle status updated successfully", vehicle)
  );
});

export const getVehicleHistory = asyncHandler(async (req, res) => {
  const history = await vehicleService.getVehicleHistory(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, "Vehicle history fetched successfully", history)
  );
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const result = await vehicleService.deleteVehicle(req.params.id);
  await writeAuditLog({
    userId: req.user?.id,
    action: "VEHICLE_DELETED",
    entityType: "Vehicle",
    entityId: req.params.id,
    ipAddress: req.ip,
  });

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});
