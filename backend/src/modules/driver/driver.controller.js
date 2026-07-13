import driverService from "./driver.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createDriverSchema,
  updateDriverSchema,
} from "./driver.validator.js";

export const createDriver = asyncHandler(async (req, res) => {
  const data = createDriverSchema.parse(req.body);

  const driver = await driverService.createDriver(data);

  return res.status(201).json(
    new ApiResponse(
      201,
      "Driver created successfully",
      driver
    )
  );
});

export const getAllDrivers = asyncHandler(async (req, res) => {
  const drivers = await driverService.getAllDrivers();

  return res.status(200).json(
    new ApiResponse(
      200,
      "Drivers fetched successfully",
      drivers
    )
  );
});

export const getDriverById = asyncHandler(async (req, res) => {
  const driver = await driverService.getDriverById(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Driver fetched successfully",
      driver
    )
  );
});

export const updateDriver = asyncHandler(async (req, res) => {
  const data = updateDriverSchema.parse(req.body);

  const driver = await driverService.updateDriver(
    req.params.id,
    data
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Driver updated successfully",
      driver
    )
  );
});

export const deleteDriver = asyncHandler(async (req, res) => {
  const result = await driverService.deleteDriver(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      result.message,
      null
    )
  );
});