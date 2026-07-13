import vehicleRepository from "./vehicle.repository.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../config/prisma.js";

class VehicleService {
  async createVehicle(data) {
    const duplicate = await prisma.vehicle.findUnique({
      where: {
        registrationNo: data.registrationNo,
      },
    });

    if (duplicate) {
      throw new ApiError(409, "Vehicle registration number already exists");
    }

    return await vehicleRepository.createVehicle({
      ...data,
      status: data.status || "AVAILABLE",
    });
  }

  async getAllVehicles(filters = {}) {
    return await vehicleRepository.getAllVehicles(filters);
  }

  async getAvailableVehicles() {
    return await vehicleRepository.getAllVehicles({
      status: "AVAILABLE",
    });
  }

  async getVehicleById(id) {
    const vehicle = await vehicleRepository.getVehicleById(id);

    if (!vehicle || vehicle.deletedAt) {
      throw new ApiError(404, "Vehicle not found");
    }

    return vehicle;
  }

  async updateVehicle(id, data) {
    const vehicle = await this.getVehicleById(id);

    if (data.registrationNo && data.registrationNo !== vehicle.registrationNo) {
      const activeTrip = await prisma.trip.findFirst({
        where: {
          vehicleId: id,
          status: {
            in: ["ASSIGNED", "IN_PROGRESS"],
          },
          deletedAt: null,
        },
      });

      if (activeTrip) {
        throw new ApiError(
          409,
          "Registration number cannot be changed while vehicle has an active trip"
        );
      }
    }

    return await vehicleRepository.updateVehicle(id, data);
  }

  async updateVehicleStatus(id, status) {
    const vehicle = await this.getVehicleById(id);

    if (!["AVAILABLE", "OUT_OF_SERVICE"].includes(status)) {
      throw new ApiError(
        422,
        "Vehicle status can only be manually changed to AVAILABLE or OUT_OF_SERVICE"
      );
    }

    const activeTrip = await prisma.trip.findFirst({
      where: {
        vehicleId: id,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS"],
        },
        deletedAt: null,
      },
    });

    if (activeTrip) {
      throw new ApiError(
        422,
        "Vehicle status cannot be changed while an active trip exists"
      );
    }

    const openMaintenance = await prisma.maintenance.findFirst({
      where: {
        vehicleId: id,
        status: {
          in: ["SCHEDULED", "IN_PROGRESS"],
        },
      },
    });

    if (status === "AVAILABLE" && openMaintenance) {
      throw new ApiError(
        422,
        "Vehicle cannot be marked available while maintenance is open"
      );
    }

    if (["ON_TRIP", "IN_MAINTENANCE"].includes(vehicle.status)) {
      throw new ApiError(
        422,
        "System-controlled vehicle status cannot be manually overridden"
      );
    }

    return await vehicleRepository.updateVehicle(id, { status });
  }

  async deleteVehicle(id) {
    await this.getVehicleById(id);

    const blockingTrip = await prisma.trip.findFirst({
      where: {
        vehicleId: id,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS"],
        },
        deletedAt: null,
      },
    });

    if (blockingTrip) {
      throw new ApiError(
        409,
        "Vehicle cannot be deleted while an active trip exists"
      );
    }

    await vehicleRepository.deleteVehicle(id);

    return {
      message: "Vehicle deleted successfully",
    };
  }

  async getVehicleHistory(id) {
    await this.getVehicleById(id);

    const [trips, maintenance, fuelLogs] = await Promise.all([
      prisma.trip.findMany({
        where: {
          vehicleId: id,
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.maintenance.findMany({
        where: {
          vehicleId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.fuelLog.findMany({
        where: {
          vehicleId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return { trips, maintenance, fuelLogs };
  }
}

export default new VehicleService();
