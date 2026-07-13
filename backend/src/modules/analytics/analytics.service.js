import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

const toNumber = (value) => Number(value || 0);

const dateWhere = (field, query = {}) => {
  const where = {};

  if (query.dateFrom || query.dateTo) {
    where[field] = {};
    if (query.dateFrom) where[field].gte = new Date(query.dateFrom);
    if (query.dateTo) where[field].lte = new Date(query.dateTo);
  }

  return where;
};

export const getVehicleUtilization = async () => {
  const statuses = await prisma.vehicle.groupBy({
    by: ["status"],
    where: {
      deletedAt: null,
    },
    _count: true,
  });

  const counts = statuses.reduce(
    (acc, row) => ({
      ...acc,
      [row.status]: row._count,
    }),
    {}
  );

  const available = counts.AVAILABLE || 0;
  const onTrip = counts.ON_TRIP || 0;
  const inShop = counts.IN_MAINTENANCE || 0;
  const outOfService = counts.OUT_OF_SERVICE || 0;
  const activeFleet = available + onTrip + inShop;

  return {
    available,
    onTrip,
    inShop,
    outOfService,
    utilizationRate: activeFleet ? onTrip / activeFleet : 0,
  };
};

export const getCostPerKm = async (query = {}) => {
  const [fuel, expenses, maintenance, trips] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: {
        ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
        ...dateWhere("fuelDate", query),
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.expense.aggregate({
      where: {
        ...(query.vehicleId
          ? {
              trip: {
                vehicleId: query.vehicleId,
              },
            }
          : {}),
        ...dateWhere("expenseDate", query),
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.maintenance.aggregate({
      where: {
        ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
        ...dateWhere("serviceDate", query),
      },
      _sum: {
        cost: true,
      },
    }),
    prisma.trip.aggregate({
      where: {
        ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
        status: "COMPLETED",
        deletedAt: null,
        ...dateWhere("actualEnd", query),
      },
      _sum: {
        distanceKm: true,
      },
      _count: true,
    }),
  ]);

  const totalCost =
    toNumber(fuel._sum.totalAmount) +
    toNumber(expenses._sum.amount) +
    toNumber(maintenance._sum.cost);
  const totalDistance = toNumber(trips._sum.distanceKm);

  return {
    costPerKm: totalDistance ? totalCost / totalDistance : 0,
    totalCost,
    totalDistance,
    sampleSize: trips._count,
  };
};

export const getFuelEfficiency = async (query = {}) => {
  const [fuel, trips] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: {
        ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
      },
      _sum: {
        quantity: true,
      },
    }),
    prisma.trip.aggregate({
      where: {
        ...(query.vehicleId ? { vehicleId: query.vehicleId } : {}),
        status: "COMPLETED",
        deletedAt: null,
      },
      _sum: {
        distanceKm: true,
      },
    }),
  ]);

  const liters = toNumber(fuel._sum.quantity);
  const distance = toNumber(trips._sum.distanceKm);

  return {
    period: query.period || "all",
    kmPerLiter: liters ? distance / liters : 0,
    totalDistance: distance,
    totalFuel: liters,
  };
};

export const getDriverPerformance = async (query = {}) => {
  const drivers = await prisma.driver.findMany({
    where: {
      ...(query.driverId ? { id: query.driverId } : {}),
      deletedAt: null,
    },
    include: {
      trips: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return drivers.map((driver) => {
    const totalTrips = driver.trips.length;
    const completedTrips = driver.trips.filter(
      (trip) => trip.status === "COMPLETED"
    ).length;

    return {
      driverId: driver.id,
      name: driver.fullName,
      completionRate: totalTrips ? completedTrips / totalTrips : 0,
      safetyScore: totalTrips ? Math.max(70, 100 - (totalTrips - completedTrips) * 5) : 100,
      complaints: 0,
      status: driver.status,
    };
  });
};

export const getRoi = async (query = {}) => {
  const vehicle = query.vehicleId
    ? await prisma.vehicle.findFirst({
        where: {
          id: query.vehicleId,
          deletedAt: null,
        },
      })
    : null;

  if (query.vehicleId && !vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (vehicle && !vehicle.acquisitionCost) {
    throw new ApiError(
      422,
      "Acquisition cost is required to compute vehicle ROI"
    );
  }

  const cost = await getCostPerKm(query);
  const revenue = 0;
  const acquisitionCost = toNumber(vehicle?.acquisitionCost);
  const roi = acquisitionCost ? (revenue - cost.totalCost) / acquisitionCost : 0;

  return {
    vehicleId: query.vehicleId || null,
    revenue,
    maintenanceCost: 0,
    fuelCost: 0,
    totalCost: cost.totalCost,
    acquisitionCost,
    roi,
  };
};
