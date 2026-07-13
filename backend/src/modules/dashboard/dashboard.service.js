import * as dashboardRepository from "./dashboard.repository.js";

export const getDashboardSummary = async () => {
  return await dashboardRepository.getDashboardSummary();
};

export const getRecentTrips = async (query = {}) => {
  return await dashboardRepository.getRecentTrips(query.limit, query.status);
};

export const getUpcomingMaintenance = async () => {
  return await dashboardRepository.getUpcomingMaintenance();
};

export const getLicenseExpiryAlerts = async (query = {}) => {
  return await dashboardRepository.getLicenseExpiryAlerts(query.withinDays);
};

export const getVehicleStatus = async () => {
  return await dashboardRepository.getVehicleStatus();
};

export const getDriverStatus = async () => {
  return await dashboardRepository.getDriverStatus();
};

export const getMonthlyExpense = async () => {
  return await dashboardRepository.getMonthlyExpense();
};

export const getRecentActivity = async () => {
  return await dashboardRepository.getRecentActivity();
};
