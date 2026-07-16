import fuelService from "./fuel.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { writeAuditLog } from "../../utils/audit.js";
import {
  createFuelSchema,
  updateFuelSchema,
} from "./fuel.validator.js";

export const createFuel = asyncHandler(async (req, res) => {
  const data = createFuelSchema.parse(req.body);
  const fuel = await fuelService.createFuel(data);
  await writeAuditLog({
    userId: req.user?.id,
    action: "FUEL_LOG_CREATED",
    entityType: "FuelLog",
    entityId: fuel.id,
    newData: fuel,
    ipAddress: req.ip,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Fuel log created successfully", fuel));
});

export const getAllFuel = asyncHandler(async (req, res) => {
  const fuel = await fuelService.getAllFuel();

  return res
    .status(200)
    .json(new ApiResponse(200, "Fuel logs fetched successfully", fuel));
});

export const getFuelById = asyncHandler(async (req, res) => {
  const fuel = await fuelService.getFuelById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Fuel log fetched successfully", fuel));
});

export const updateFuel = asyncHandler(async (req, res) => {
  const data = updateFuelSchema.parse(req.body);
  const oldFuel = await fuelService.getFuelById(req.params.id);
  const fuel = await fuelService.updateFuel(req.params.id, data);
  await writeAuditLog({
    userId: req.user?.id,
    action: "FUEL_LOG_UPDATED",
    entityType: "FuelLog",
    entityId: fuel.id,
    oldData: oldFuel,
    newData: fuel,
    ipAddress: req.ip,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Fuel log updated successfully", fuel));
});

export const deleteFuel = asyncHandler(async (req, res) => {
  await fuelService.deleteFuel(req.params.id);
  await writeAuditLog({
    userId: req.user?.id,
    action: "FUEL_LOG_DELETED",
    entityType: "FuelLog",
    entityId: req.params.id,
    ipAddress: req.ip,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Fuel log deleted successfully", null));
});
