import maintenanceRepository from "./maintenance.repository.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../config/prisma.js";

const openStatuses = ["SCHEDULED", "IN_PROGRESS"];

class MaintenanceService {
  async createMaintenance(data) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        deletedAt: null,
      },
    });

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    if (vehicle.status === "ON_TRIP") {
      throw new ApiError(
        422,
        "Maintenance cannot be opened while vehicle is on an active trip"
      );
    }

    const openMaintenance = await prisma.maintenance.findFirst({
      where: {
        vehicleId: data.vehicleId,
        status: {
          in: openStatuses,
        },
      },
    });

    if (openMaintenance && openStatuses.includes(data.status || "SCHEDULED")) {
      throw new ApiError(
        409,
        "Vehicle already has an open maintenance record"
      );
    }

    return await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.create({
        data: {
          ...data,
          status: data.status || "SCHEDULED",
        },
        include: {
          vehicle: true,
          trip: true,
        },
      });

      if (openStatuses.includes(maintenance.status)) {
        await tx.vehicle.update({
          where: {
            id: data.vehicleId,
          },
          data: {
            status: "IN_MAINTENANCE",
          },
        });
      }

      return maintenance;
    });
  }

  async getAllMaintenances() {
    return await maintenanceRepository.getAllMaintenances();
  }

  async getMaintenanceById(id) {
    const maintenance = await maintenanceRepository.getMaintenanceById(id);

    if (!maintenance) {
      throw new ApiError(404, "Maintenance record not found");
    }

    return maintenance;
  }

  async updateMaintenance(id, data) {
    const existing = await this.getMaintenanceById(id);

    return await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.update({
        where: {
          id,
        },
        data,
        include: {
          vehicle: true,
          trip: true,
        },
      });

      if (data.status && openStatuses.includes(data.status)) {
        await tx.vehicle.update({
          where: {
            id: existing.vehicleId,
          },
          data: {
            status: "IN_MAINTENANCE",
          },
        });
      }

      if (data.status === "COMPLETED" || data.status === "CANCELLED") {
        await this.releaseVehicleIfNoOpenMaintenance(existing.vehicleId, tx);
      }

      return maintenance;
    });
  }

  async completeMaintenance(id, data = {}) {
    const maintenance = await this.getMaintenanceById(id);

    if (maintenance.status === "COMPLETED") {
      return maintenance;
    }

    if (maintenance.status === "CANCELLED") {
      throw new ApiError(422, "Cancelled maintenance cannot be completed");
    }

    return await prisma.$transaction(async (tx) => {
      const updatedMaintenance = await tx.maintenance.update({
        where: {
          id,
        },
        data: {
          status: "COMPLETED",
          nextServiceDate: data.nextServiceDate,
          cost: data.cost,
        },
        include: {
          vehicle: true,
          trip: true,
        },
      });

      await this.releaseVehicleIfNoOpenMaintenance(maintenance.vehicleId, tx);

      return updatedMaintenance;
    });
  }

  async releaseVehicleIfNoOpenMaintenance(vehicleId, tx = prisma) {
    const openMaintenance = await tx.maintenance.findFirst({
      where: {
        vehicleId,
        status: {
          in: openStatuses,
        },
      },
    });

    if (!openMaintenance) {
      const activeTrip = await tx.trip.findFirst({
        where: {
          vehicleId,
          status: {
            in: ["ASSIGNED", "IN_PROGRESS"],
          },
          deletedAt: null,
        },
      });

      if (!activeTrip) {
        await tx.vehicle.update({
          where: {
            id: vehicleId,
          },
          data: {
            status: "AVAILABLE",
          },
        });
      }
    }
  }

  async deleteMaintenance(id) {
    const maintenance = await this.getMaintenanceById(id);

    await prisma.$transaction(async (tx) => {
      await tx.maintenance.delete({
        where: {
          id,
        },
      });

      await this.releaseVehicleIfNoOpenMaintenance(maintenance.vehicleId, tx);
    });

    return {
      message: "Maintenance deleted successfully",
    };
  }
}

export default new MaintenanceService();
