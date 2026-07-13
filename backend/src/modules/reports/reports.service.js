import prisma from "../../config/prisma.js";
import { getCostPerKm, getFuelEfficiency, getRoi } from "../analytics/analytics.service.js";

const toNumber = (value) => Number(value || 0);

export const getMonthlyReport = async (query = {}) => {
  const now = new Date();
  const [year, month] = query.month
    ? query.month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const [trips, fuel, maintenance, expenses] = await Promise.all([
    prisma.trip.aggregate({
      where: {
        status: "COMPLETED",
        deletedAt: null,
        actualEnd: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _count: true,
      _sum: {
        distanceKm: true,
      },
    }),
    prisma.fuelLog.aggregate({
      where: {
        fuelDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: {
        totalAmount: true,
        quantity: true,
      },
    }),
    prisma.maintenance.aggregate({
      where: {
        serviceDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: {
        cost: true,
      },
    }),
    prisma.expense.aggregate({
      where: {
        expenseDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const fuelCost = toNumber(fuel._sum.totalAmount);
  const maintenanceCost = toNumber(maintenance._sum.cost);
  const otherExpense = toNumber(expenses._sum.amount);
  const revenue = 0;

  return {
    month,
    year,
    revenue,
    fuelCost,
    maintenanceCost,
    otherExpense,
    netProfit: revenue - fuelCost - maintenanceCost - otherExpense,
    tripCount: trips._count,
    totalDistance: toNumber(trips._sum.distanceKm),
    fuelEfficiency:
      toNumber(fuel._sum.quantity) > 0
        ? toNumber(trips._sum.distanceKm) / toNumber(fuel._sum.quantity)
        : 0,
    locked: false,
    generatedAt: new Date(),
  };
};

export const getVehicleReport = async (vehicleId, query = {}) => {
  const [vehicle, costPerKm, fuelEfficiency, roi] = await Promise.all([
    prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        deletedAt: null,
      },
    }),
    getCostPerKm({ ...query, vehicleId }),
    getFuelEfficiency({ ...query, vehicleId }),
    getRoi({ ...query, vehicleId }).catch((error) => ({
      error: error.message,
      roi: 0,
    })),
  ]);

  return {
    vehicle,
    costPerKm,
    fuelEfficiency,
    roi,
  };
};

export const getDriverReport = async (driverId) => {
  const driver = await prisma.driver.findFirst({
    where: {
      id: driverId,
      deletedAt: null,
    },
    include: {
      trips: true,
    },
  });

  if (!driver) return null;

  const completedTrips = driver.trips.filter(
    (trip) => trip.status === "COMPLETED"
  ).length;

  return {
    driverId: driver.id,
    name: driver.fullName,
    totalTrips: driver.trips.length,
    completedTrips,
    completionRate: driver.trips.length ? completedTrips / driver.trips.length : 0,
    status: driver.status,
  };
};

export const getExpenseReport = async () => {
  const rows = await prisma.expense.groupBy({
    by: ["expenseType"],
    _sum: {
      amount: true,
    },
    _count: true,
  });

  return rows.map((row) => ({
    category: row.expenseType,
    amount: toNumber(row._sum.amount),
    count: row._count,
  }));
};

export const getMaintenanceReport = async () => {
  const rows = await prisma.maintenance.groupBy({
    by: ["status"],
    _sum: {
      cost: true,
    },
    _count: true,
  });

  return rows.map((row) => ({
    status: row.status,
    cost: toNumber(row._sum.cost),
    count: row._count,
  }));
};

export const toCsv = (rows) => {
  const items = Array.isArray(rows) ? rows : [rows];
  const headers = [...new Set(items.flatMap((item) => Object.keys(item)))];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

  return [
    headers.join(","),
    ...items.map((item) => headers.map((header) => escape(item[header])).join(",")),
  ].join("\n");
};
