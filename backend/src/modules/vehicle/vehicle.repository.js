import prisma from "../../config/prisma.js";

class VehicleRepository {
  async createVehicle(data) {
    return await prisma.vehicle.create({
      data,
    });
  }

  async getAllVehicles(filters = {}) {
    const where = {
      deletedAt: null,
    };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.vehicleType = filters.type;

    if (filters.search) {
      where.OR = [
        { registrationNo: { contains: filters.search, mode: "insensitive" } },
        { make: { contains: filters.search, mode: "insensitive" } },
        { model: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.minCapacity || filters.maxCapacity) {
      where.capacityKg = {};
      if (filters.minCapacity) where.capacityKg.gte = Number(filters.minCapacity);
      if (filters.maxCapacity) where.capacityKg.lte = Number(filters.maxCapacity);
    }

    return await prisma.vehicle.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getVehicleById(id) {
    return await prisma.vehicle.findUnique({
      where: {
        id,
      },
      include: {
        trips: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        maintenanceLogs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        fuelLogs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });
  }

  async updateVehicle(id, data) {
    return await prisma.vehicle.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteVehicle(id) {
    return await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new VehicleRepository();
