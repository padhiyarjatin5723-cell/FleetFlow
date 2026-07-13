import * as dashboardService from "./dashboard.service.js";

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
    const data = await dashboardService.getRecentTrips(req.query);

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

export const getLicenseExpiryAlerts = async (req, res, next) => {
  try {
    const data = await dashboardService.getLicenseExpiryAlerts(req.query);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "License expiry alerts fetched successfully",
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

export const getRecentActivity = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentActivity();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Recent activity fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
