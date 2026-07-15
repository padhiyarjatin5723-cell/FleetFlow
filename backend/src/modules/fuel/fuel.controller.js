import fuelService from "./fuel.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import {
  createFuelSchema,
  updateFuelSchema,
} from "./fuel.validator.js";

export const createFuel = asyncHandler(async (req, res) => {
  const data = createFuelSchema.parse(req.body);
  const fuel = await fuelService.createFuel(data);

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
  const fuel = await fuelService.updateFuel(req.params.id, data);

  return res
    .status(200)
    .json(new ApiResponse(200, "Fuel log updated successfully", fuel));
});

export const deleteFuel = asyncHandler(async (req, res) => {
  await fuelService.deleteFuel(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Fuel log deleted successfully", null));
});
