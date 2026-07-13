import prisma from "../../config/prisma.js";

class TripRepository {
  async findTripByNumber(tripNumber) {
    return await prisma.trip.findUnique({
      where: {
        tripNumber,
      },
    });
  }

  async createTrip(data) {
    return await prisma.trip.create({
      data,
      include: {
        vehicle: true,
        driver: true,
      },
    });
  }

  async getAllTrips(filters = {}) {
    const where = {
      deletedAt: null,
    };

    if (filters.status) where.status = filters.status;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.driverId) where.driverId = filters.driverId;

    if (filters.search) {
      where.OR = [
        { tripNumber: { contains: filters.search, mode: "insensitive" } },
        { source: { contains: filters.search, mode: "insensitive" } },
        { destination: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.scheduledStart = {};
      if (filters.dateFrom) where.scheduledStart.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.scheduledStart.lte = new Date(filters.dateTo);
    }

    return await prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getTripById(id) {
    return await prisma.trip.findUnique({
      where: {
        id,
      },
      include: {
        vehicle: true,
        driver: true,
        fuelLogs: true,
        expenses: true,
        maintenanceLogs: true,
      },
    });
  }

  async updateTrip(id, data) {
    return await prisma.trip.update({
      where: {
        id,
      },
      data,
      include: {
        vehicle: true,
        driver: true,
      },
    });
  }

  async deleteTrip(id) {
    return await prisma.trip.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new TripRepository();
