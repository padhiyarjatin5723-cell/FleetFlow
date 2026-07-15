import tripRepository from "./trip.repository.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../config/prisma.js";

const activeTripStatuses = ["ASSIGNED", "IN_PROGRESS"];

const normalizeTripData = (data) => {
  const { cargoWeightKg, ...rest } = data;

  return {
    ...rest,
    ...(cargoWeightKg !== undefined ? { cargoWeightkg: cargoWeightKg } : {}),
    ...(data.status ? { status: data.status } : {}),
  };
};

const isLicenseExpired = (driver) => new Date(driver.licenseExpiry) < new Date();

class TripService {
  async assertDispatchAllowed(data, tx = prisma) {
    const [vehicle, driver] = await Promise.all([
      tx.vehicle.findFirst({
        where: {
          id: data.vehicleId,
          deletedAt: null,
        },
      }),
      tx.driver.findFirst({
        where: {
          id: data.driverId,
          deletedAt: null,
        },
      }),
    ]);

    if (!vehicle) throw new ApiError(404, "Vehicle not found");
    if (!driver) throw new ApiError(404, "Driver not found");

    if (vehicle.status !== "AVAILABLE") {
      throw new ApiError(422, "Vehicle must be available to dispatch a trip");
    }

    if (driver.status !== "AVAILABLE") {
      throw new ApiError(422, "Driver must be available to dispatch a trip");
    }

    if (isLicenseExpired(driver)) {
      throw new ApiError(422, "Driver license is expired");
    }

    if (data.cargoWeightKg > vehicle.capacityKg) {
      const overage = data.cargoWeightKg - vehicle.capacityKg;
      throw new ApiError(
        422,
        `Cargo exceeds vehicle capacity by ${overage} kg`
      );
    }

    const [vehicleTrip, driverTrip] = await Promise.all([
      tx.trip.findFirst({
        where: {
          vehicleId: data.vehicleId,
          status: {
            in: activeTripStatuses,
          },
          deletedAt: null,
        },
      }),
      tx.trip.findFirst({
        where: {
          driverId: data.driverId,
          status: {
            in: activeTripStatuses,
          },
          deletedAt: null,
        },
      }),
    ]);

    if (vehicleTrip) {
      throw new ApiError(409, "Vehicle already has an active trip");
    }

    if (driverTrip) {
      throw new ApiError(409, "Driver already has an active trip");
    }
  }

  async createTrip(data) {
    const existingTrip = await tripRepository.findTripByNumber(data.tripNumber);

    if (existingTrip) {
      throw new ApiError(409, "Trip number already exists");
    }

    const shouldDispatch = ["ASSIGNED", "IN_PROGRESS"].includes(data.status);

    if (!shouldDispatch) {
      return await tripRepository.createTrip({
        ...normalizeTripData(data),
        status: data.status || "PLANNED",
      });
    }

    return await prisma.$transaction(async (tx) => {
      await this.assertDispatchAllowed(data, tx);

      const trip = await tx.trip.create({
        data: normalizeTripData(data),
        include: {
          vehicle: true,
          driver: true,
        },
      });

      await tx.vehicle.update({
        where: {
          id: data.vehicleId,
        },
        data: {
          status: "ON_TRIP",
        },
      });

      await tx.driver.update({
        where: {
          id: data.driverId,
        },
        data: {
          status: "ON_TRIP",
        },
      });

      return trip;
    });
  }

  async getAllTrips(filters = {}) {
    return await tripRepository.getAllTrips(filters);
  }

  async getCompletedTrips() {
    return await tripRepository.getAllTrips({
      status: "COMPLETED",
    });
  }

  async getTripById(id) {
    const trip = await tripRepository.getTripById(id);

    if (!trip || trip.deletedAt) {
      throw new ApiError(404, "Trip not found");
    }

    return trip;
  }

  async updateTrip(id, data) {
    const trip = await this.getTripById(id);

    if (activeTripStatuses.includes(trip.status)) {
      throw new ApiError(409, "Active trips must be changed through status flow");
    }

    return await tripRepository.updateTrip(id, normalizeTripData(data));
  }

  async updateTripStatus(id, data) {
    const trip = await this.getTripById(id);

    const validTransitions = {
      PLANNED: ["ASSIGNED", "CANCELLED"],
      ASSIGNED: ["IN_PROGRESS", "COMPLETED", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[trip.status]?.includes(data.status)) {
      throw new ApiError(
        422,
        `Trip cannot move from ${trip.status} to ${data.status}`
      );
    }

    return await prisma.$transaction(async (tx) => {
      if (data.status === "ASSIGNED") {
        await this.assertDispatchAllowed(
          {
            vehicleId: trip.vehicleId,
            driverId: trip.driverId,
            cargoWeightKg: trip.cargoWeightkg,
          },
          tx
        );
      }

      const updatedTrip = await tx.trip.update({
        where: {
          id,
        },
        data: {
          status: data.status,
          actualStart: data.actualStart,
          actualEnd: data.actualEnd || (data.status === "COMPLETED" ? new Date() : undefined),
          remarks: data.remarks,
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });

      if (data.status === "ASSIGNED" || data.status === "IN_PROGRESS") {
        await tx.vehicle.update({
          where: {
            id: trip.vehicleId,
          },
          data: {
            status: "ON_TRIP",
          },
        });

        await tx.driver.update({
          where: {
            id: trip.driverId,
          },
          data: {
            status: "ON_TRIP",
          },
        });
      }

      if (data.status === "COMPLETED" || data.status === "CANCELLED") {
        const openMaintenance = await tx.maintenance.findFirst({
          where: {
            vehicleId: trip.vehicleId,
            status: {
              in: ["SCHEDULED", "IN_PROGRESS"],
            },
          },
        });

        await tx.vehicle.update({
          where: {
            id: trip.vehicleId,
          },
          data: {
            status: openMaintenance ? "IN_MAINTENANCE" : "AVAILABLE",
          },
        });

        await tx.driver.update({
          where: {
            id: trip.driverId,
          },
          data: {
            status: "AVAILABLE",
          },
        });
      }

      return updatedTrip;
    });
  }

  async deleteTrip(id) {
    const trip = await this.getTripById(id);

    if (trip.status !== "PLANNED") {
      throw new ApiError(409, "Only planned draft trips can be deleted");
    }

    await tripRepository.deleteTrip(id);

    return {
      message: "Trip deleted successfully",
    };
  }
}

export default new TripService();
