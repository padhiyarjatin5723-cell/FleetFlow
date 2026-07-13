import prisma from "../../config/prisma.js";

class MaintenanceRepository {
  async createMaintenance(data) {
    return await prisma.maintenance.create({
      data,
    });
  }

  async getAllMaintenances() {
    return await prisma.maintenance.findMany({
      include: {
        vehicle: true,
        trip: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getMaintenanceById(id) {
    return await prisma.maintenance.findUnique({
      where: {
        id,
      },
      include: {
        vehicle: true,
        trip: true,
      },
    });
  }

  async updateMaintenance(id, data) {
    return await prisma.maintenance.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteMaintenance(id) {
    return await prisma.maintenance.delete({
      where: {
        id,
      },
    });
  }
}

export default new MaintenanceRepository();