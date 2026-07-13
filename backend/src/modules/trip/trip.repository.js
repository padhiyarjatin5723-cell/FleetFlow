import prisma from "../../config/prisma.js";

class TripRepository {
  async findTripByNumber(tripNumber) {
    return await prisma.trip.findUnique({
      where: {
        tripNumber,
      },
    });
  }

  async createTrip(data) {
    return await prisma.trip.create({
      data,
    });
  }

  async getAllTrips() {
    return await prisma.trip.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getTripById(id) {
    return await prisma.trip.findUnique({
      where: {
        id,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });
  }

  async updateTrip(id, data) {
    return await prisma.trip.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteTrip(id) {
    return await prisma.trip.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new TripRepository();