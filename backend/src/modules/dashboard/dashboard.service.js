import * as dashboardRepository from "./dashboard.repository.js";

export const getDashboardSummary = async () => {
  return await dashboardRepository.getDashboardSummary();
};

export const getRecentTrips = async () => {
  return await dashboardRepository.getRecentTrips();
};

export const getUpcomingMaintenance = async () => {
  return await dashboardRepository.getUpcomingMaintenance();
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