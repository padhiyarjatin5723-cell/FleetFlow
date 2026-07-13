import prisma from "../../config/prisma.js";

export const getDashboardSummary = async () => {
  const [
    totalVehicles,
    activeFleet,
    onTripVehicles,
    maintenanceAlerts,
    pendingCargo,
    totalDrivers,
    totalTrips,
    activeTrips,
    availableVehicles,
    availableDrivers,
    totalExpense,
  ] = await Promise.all([
    prisma.vehicle.count({
      where: {
        deletedAt: null,
      },
    }),
    prisma.vehicle.count({
      where: {
        deletedAt: null,
        status: {
          not: "OUT_OF_SERVICE",
        },
      },
    }),
    prisma.vehicle.count({
      where: {
        deletedAt: null,
        status: "ON_TRIP",
      },
    }),
    prisma.maintenance.count({
      where: {
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"],
        },
      },
    }),
    prisma.trip.count({
      where: {
        status: "PLANNED",
        deletedAt: null,
      },
    }),
    prisma.driver.count({
      where: {
        deletedAt: null,
      },
    }),
    prisma.trip.count({
      where: {
        deletedAt: null,
      },
    }),
    prisma.trip.count({
      where: {
        status: {
          in: ["ASSIGNED", "IN_PROGRESS"],
        },
        deletedAt: null,
      },
    }),
    prisma.vehicle.count({
      where: {
        status: "AVAILABLE",
        deletedAt: null,
      },
    }),
    prisma.driver.count({
      where: {
        status: "AVAILABLE",
        deletedAt: null,
      },
    }),
    prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    }),
  ]);

  const utilizationRate = activeFleet ? onTripVehicles / activeFleet : 0;

  return {
    activeFleet,
    maintenanceAlerts,
    utilizationRate,
    pendingCargo,
    totalVehicles,
    totalDrivers,
    totalTrips,
    activeTrips,
    availableVehicles,
    availableDrivers,
    pendingMaintenance: maintenanceAlerts,
    totalExpenses: totalExpense._sum.amount || 0,
  };
};

export const getRecentTrips = async (limit = 5, status) => {
  return prisma.trip.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    include: {
      vehicle: true,
      driver: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: Number(limit),
  });
};

export const getUpcomingMaintenance = async () => {
  return prisma.maintenance.findMany({
    where: {
      status: {
        in: ["SCHEDULED", "IN_PROGRESS"],
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      serviceDate: "asc",
    },
    take: 5,
  });
};

export const getLicenseExpiryAlerts = async (withinDays = 30) => {
  const today = new Date();
  const limit = new Date();
  limit.setDate(today.getDate() + Number(withinDays));

  const drivers = await prisma.driver.findMany({
    where: {
      deletedAt: null,
      licenseExpiry: {
        lte: limit,
      },
    },
    orderBy: {
      licenseExpiry: "asc",
    },
    take: 10,
  });

  return drivers.map((driver) => ({
    driverId: driver.id,
    name: driver.fullName,
    licenseExpiry: driver.licenseExpiry,
    daysRemaining: Math.ceil(
      (new Date(driver.licenseExpiry) - today) / (1000 * 60 * 60 * 24)
    ),
  }));
};

export const getVehicleStatus = async () => {
  return prisma.vehicle.groupBy({
    by: ["status"],
    where: {
      deletedAt: null,
    },
    _count: true,
  });
};

export const getDriverStatus = async () => {
  return prisma.driver.groupBy({
    by: ["status"],
    where: {
      deletedAt: null,
    },
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

export const getRecentActivity = async () => {
  return prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
};
