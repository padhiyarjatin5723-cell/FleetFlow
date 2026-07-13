import tripRepository from "./trip.repository.js";
import ApiError from "../../utils/ApiError.js";

class TripService {
  async createTrip(data) {
    const existingTrip = await tripRepository.findTripByNumber(
      data.tripNumber
    );

    if (existingTrip) {
      throw new ApiError(409, "Trip number already exists");
    }

    return await tripRepository.createTrip(data);
  }

  async getAllTrips() {
    return await tripRepository.getAllTrips();
  }

  async getTripById(id) {
    const trip = await tripRepository.getTripById(id);

    if (!trip || trip.deletedAt) {
      throw new ApiError(404, "Trip not found");
    }

    return trip;
  }

  async updateTrip(id, data) {
    await this.getTripById(id);

    return await tripRepository.updateTrip(id, data);
  }

  async deleteTrip(id) {
    await this.getTripById(id);

    await tripRepository.deleteTrip(id);

    return {
      message: "Trip deleted successfully",
    };
  }
}

export default new TripService();