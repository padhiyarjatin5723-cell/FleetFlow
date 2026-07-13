import * as dashboardService from "./dashboard.service.js";

console.log(dashboardService);

export const getDashboardSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardSummary();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Dashboard summary fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentTrips = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentTrips();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Recent trips fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingMaintenance = async (req, res, next) => {
  try {
    const data = await dashboardService.getUpcomingMaintenance();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Upcoming maintenance fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleStatus = async (req, res, next) => {
  try {
    const data = await dashboardService.getVehicleStatus();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Vehicle status fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverStatus = async (req, res, next) => {
  try {
    const data = await dashboardService.getDriverStatus();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Driver status fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyExpense = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyExpense();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Monthly expenses fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};