import vehicleRepository from "./vehicle.repository.js";
import ApiError from "../../utils/ApiError.js";

class VehicleService {
  async createVehicle(data) {
    return await vehicleRepository.createVehicle(data);
  }

  async getAllVehicles() {
    return await vehicleRepository.getAllVehicles();
  }

  async getVehicleById(id) {
    const vehicle = await vehicleRepository.getVehicleById(id);

    if (!vehicle || vehicle.deletedAt) {
      throw new ApiError(404, "Vehicle not found");
    }

    return vehicle;
  }

  async updateVehicle(id, data) {
    await this.getVehicleById(id);

    return await vehicleRepository.updateVehicle(id, data);
  }

  async deleteVehicle(id) {
    await this.getVehicleById(id);

    await vehicleRepository.deleteVehicle(id);

    return {
      message: "Vehicle deleted successfully",
    };
  }
}

export default new VehicleService();