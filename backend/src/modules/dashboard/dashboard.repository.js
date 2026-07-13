import prisma from "../../config/prisma.js";

export const getDashboardSummary = async () => {
  const [
    totalVehicles,
    totalDrivers,
    totalTrips,
    activeTrips,
    availableVehicles,
    availableDrivers,
    pendingMaintenance,
    totalExpense,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.driver.count(),
    prisma.trip.count(),
    prisma.trip.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),
    prisma.vehicle.count({
      where: {
        status: "AVAILABLE",
      },
    }),
    prisma.driver.count({
      where: {
        status: "AVAILABLE",
      },
    }),
    prisma.maintenance.count({
      where: {
        status: "SCHEDULED",
      },
    }),
    prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    totalVehicles,
    totalDrivers,
    totalTrips,
    activeTrips,
    availableVehicles,
    availableDrivers,
    pendingMaintenance,
    totalExpenses: totalExpense._sum.amount || 0,
  };
};

export const getRecentTrips = async () => {
  return prisma.trip.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
};

export const getUpcomingMaintenance = async () => {
  return prisma.maintenance.findMany({
    where: {
      status: "SCHEDULED",
    },
    orderBy: {
      serviceDate: "asc",
    },
    take: 5,
  });
};

export const getVehicleStatus = async () => {
  return prisma.vehicle.groupBy({
    by: ["status"],
    _count: true,
  });
};

export const getDriverStatus = async () => {
  return prisma.driver.groupBy({
    by: ["status"],
    _count: true,
  });
};

export const getMonthlyExpense = async () => {
  return prisma.expense.findMany({
    orderBy: {
      expenseDate: "asc",
    },
  });
};