import fuelRepository from "./fuel.repository.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../config/prisma.js";

class FuelService {
  async createFuel(data) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: data.vehicleId,
        deletedAt: null,
      },
    });

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    if (data.tripId) {
      const trip = await prisma.trip.findFirst({
        where: {
          id: data.tripId,
          deletedAt: null,
        },
      });

      if (!trip) {
        throw new ApiError(404, "Trip not found");
      }

      if (trip.status !== "COMPLETED") {
        throw new ApiError(422, "Fuel can only be logged for completed trips");
      }

      if (trip.vehicleId !== data.vehicleId) {
        throw new ApiError(422, "Fuel vehicle must match trip vehicle");
      }
    }

    if (vehicle.currentOdometer && data.odometerKm < vehicle.currentOdometer) {
      throw new ApiError(
        422,
        "Fuel odometer cannot be lower than vehicle current odometer"
      );
    }

    const totalAmount = data.totalAmount || data.quantity * data.pricePerLiter;

    return await fuelRepository.createFuel({
      ...data,
      totalAmount,
    });
  }

  async getAllFuel() {
    return await fuelRepository.getAllFuel();
  }

  async getFuelById(id) {
    const fuel = await fuelRepository.getFuelById(id);

    if (!fuel) {
      throw new ApiError(404, "Fuel log not found");
    }

    return fuel;
  }

  async updateFuel(id, data) {
    await this.getFuelById(id);
    return await fuelRepository.updateFuel(id, data);
  }

  async deleteFuel(id) {
    await this.getFuelById(id);
    return await fuelRepository.deleteFuel(id);
  }
}

export default new FuelService();
