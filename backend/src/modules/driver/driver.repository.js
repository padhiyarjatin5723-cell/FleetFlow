import prisma from "../../config/prisma.js";

class DriverRepository {
  async findDriverByEmail(email) {
    return await prisma.driver.findUnique({
      where: {
        email,
      },
    });
  }

  async findDriverByPhone(phone) {
    return await prisma.driver.findFirst({
      where: {
        phone,
      },
    });
  }

  async findDriverByLicense(licenseNumber) {
    return await prisma.driver.findUnique({
      where: {
        licenseNumber,
      },
    });
  }

  async createDriver(data) {
    return await prisma.driver.create({
      data,
    });
  }

  async getAllDrivers() {
    return await prisma.driver.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async getDriverById(id) {
    return await prisma.driver.findUnique({
      where: {
        id,
      },
    });
  }

  async updateDriver(id, data) {
    return await prisma.driver.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteDriver(id) {
    return await prisma.driver.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new DriverRepository();