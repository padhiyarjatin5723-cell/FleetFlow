import fuelRepository from "./fuel.repository.js";
import ApiError from "../../utils/ApiError.js";

class FuelService {
  async createFuel(data) {
    return await fuelRepository.createFuel(data);
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