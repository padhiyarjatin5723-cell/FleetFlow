import tripService from "./trip.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createTripSchema,
  updateTripSchema,
  updateTripStatusSchema,
} from "./trip.validator.js";

export const createTrip = asyncHandler(async (req, res) => {
  const data = createTripSchema.parse(req.body);
  const trip = await tripService.createTrip(data);

  return res.status(201).json(
    new ApiResponse(201, "Trip created successfully", trip)
  );
});

export const getAllTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getAllTrips(req.query);

  return res.status(200).json(
    new ApiResponse(200, "Trips fetched successfully", trips)
  );
});

export const getCompletedTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.getCompletedTrips();

  return res.status(200).json(
    new ApiResponse(200, "Completed trips fetched successfully", trips)
  );
});

export const getTripById = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, "Trip fetched successfully", trip)
  );
});

export const updateTrip = asyncHandler(async (req, res) => {
  const data = updateTripSchema.parse(req.body);
  const trip = await tripService.updateTrip(req.params.id, data);

  return res.status(200).json(
    new ApiResponse(200, "Trip updated successfully", trip)
  );
});

export const updateTripStatus = asyncHandler(async (req, res) => {
  const data = updateTripStatusSchema.parse(req.body);
  const trip = await tripService.updateTripStatus(req.params.id, data);

  return res.status(200).json(
    new ApiResponse(200, "Trip status updated successfully", trip)
  );
});

export const deleteTrip = asyncHandler(async (req, res) => {
  const result = await tripService.deleteTrip(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, result.message, null)
  );
});
