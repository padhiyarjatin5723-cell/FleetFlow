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

  async getAllDrivers(filters = {}) {
    const where = {
      deletedAt: null,
    };

    if (filters.status) where.status = filters.status;

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { employeeCode: { contains: filters.search, mode: "insensitive" } },
        { licenseNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.licenseExpiring === "true") {
      const today = new Date();
      const soon = new Date();
      soon.setDate(today.getDate() + 30);

      where.licenseExpiry = {
        gte: today,
        lte: soon,
      };
    }

    return await prisma.driver.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getDriverById(id) {
    return await prisma.driver.findUnique({
      where: {
        id,
      },
      include: {
        trips: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
          take: 10,
        },
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
