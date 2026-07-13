import * as analyticsService from "./analytics.service.js";

const send = (res, message, data) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data,
  });
};

export const getCostPerKm = async (req, res, next) => {
  try {
    send(
      res,
      "Cost per kilometer fetched successfully",
      await analyticsService.getCostPerKm(req.query)
    );
  } catch (error) {
    next(error);
  }
};

export const getFuelEfficiency = async (req, res, next) => {
  try {
    send(
      res,
      "Fuel efficiency fetched successfully",
      await analyticsService.getFuelEfficiency(req.query)
    );
  } catch (error) {
    next(error);
  }
};

export const getVehicleUtilization = async (req, res, next) => {
  try {
    send(
      res,
      "Vehicle utilization fetched successfully",
      await analyticsService.getVehicleUtilization()
    );
  } catch (error) {
    next(error);
  }
};

export const getDriverPerformance = async (req, res, next) => {
  try {
    send(
      res,
      "Driver performance fetched successfully",
      await analyticsService.getDriverPerformance(req.query)
    );
  } catch (error) {
    next(error);
  }
};

export const getRoi = async (req, res, next) => {
  try {
    send(res, "ROI fetched successfully", await analyticsService.getRoi(req.query));
  } catch (error) {
    next(error);
  }
};
