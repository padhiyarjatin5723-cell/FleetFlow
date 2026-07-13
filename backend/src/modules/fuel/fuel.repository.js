import prisma from "../../config/prisma.js";

class FuelRepository {
  async createFuel(data) {
    return await prisma.fuelLog.create({
      data,
    });
  }

  async getAllFuel() {
    return await prisma.fuelLog.findMany({
      include: {
        vehicle: true,
        trip: true,
      },
    });
  }

  async getFuelById(id) {
    return await prisma.fuelLog.findUnique({
      where: { id },
      include: {
        vehicle: true,
        trip: true,
      },
    });
  }

  async updateFuel(id, data) {
    return await prisma.fuelLog.update({
      where: { id },
      data,
    });
  }

  async deleteFuel(id) {
    return await prisma.fuelLog.delete({
      where: { id },
    });
  }
}

export default new FuelRepository();