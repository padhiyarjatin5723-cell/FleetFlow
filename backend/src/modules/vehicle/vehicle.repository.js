import prisma from "../../config/prisma.js";

class VehicleRepository {
  async createVehicle(data) {
    return await prisma.vehicle.create({
      data,
    });
  }

  async getAllVehicles() {
    return await prisma.vehicle.findMany({
      where: {
        deletedAt: null,
      },
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