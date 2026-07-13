import prisma from "../../config/prisma.js";

class AuthRepository {
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    });
  }

  async findRoleById(roleId) {
    return await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });
  }

  async findUserById(id) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
      },
    });
  }

  async createUser(data) {
    return await prisma.user.create({
      data,
    });
  }

  async saveRefreshToken(data) {
    return await prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(tokenHash) {
    return await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
      },
    });
  }

  async revokeRefreshToken(tokenHash) {
    return await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllUserTokens(userId) {
    return await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}

export default new AuthRepository();