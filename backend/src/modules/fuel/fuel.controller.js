import fuelService from "./fuel.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const createFuel = asyncHandler(async (req, res) => {
  const fuel = await fuelService.createFuel(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, fuel, "Fuel log created successfully"));
});

export const getAllFuel = asyncHandler(async (req, res) => {
  const fuel = await fuelService.getAllFuel();

  return res
    .status(200)
    .json(new ApiResponse(200, fuel, "Fuel logs fetched successfully"));
});

export const getFuelById = asyncHandler(async (req, res) => {
  const fuel = await fuelService.getFuelById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, fuel, "Fuel log fetched successfully"));
});

export const updateFuel = asyncHandler(async (req, res) => {
  const fuel = await fuelService.updateFuel(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, fuel, "Fuel log updated successfully"));
});

export const deleteFuel = asyncHandler(async (req, res) => {
  await fuelService.deleteFuel(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Fuel log deleted successfully"));
});