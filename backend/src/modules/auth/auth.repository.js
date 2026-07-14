import prisma from "../../config/prisma.js";
import crypto from "crypto";

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

  async updateUserPassword(id, passwordHash) {
    return await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async createUser(data) {
    return await prisma.user.create({
      data,
    });
  }

  async saveRefreshToken(data) {
    const tokenHash = crypto.createHash("sha256").update(data.tokenHash).digest("hex");
    try {
      return await prisma.refreshToken.create({
        data: {
          userId: data.userId,
          tokenHash,
          expiresAt: data.expiresAt,
          createdByIp: data.createdByIp || null,
        },
      });
    } catch (err) {
      // If token already exists (rare), update existing record
      return await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: {
          userId: data.userId,
          expiresAt: data.expiresAt,
          createdByIp: data.createdByIp || null,
          revokedAt: null,
        },
      });
    }
  }

  async findRefreshToken(tokenHash) {
    const hash = crypto.createHash("sha256").update(tokenHash).digest("hex");
    return await prisma.refreshToken.findFirst({
      where: {
        tokenHash: hash,
        revokedAt: null,
      },
    });
  }

  async revokeRefreshToken(tokenHash) {
    const hash = crypto.createHash("sha256").update(tokenHash).digest("hex");
    return await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hash,
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

  async savePasswordResetToken(data) {
    const tokenHash = crypto.createHash("sha256").update(data.tokenHash).digest("hex");
    return await prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findPasswordResetToken(tokenHash) {
    const hash = crypto.createHash("sha256").update(tokenHash).digest("hex");
    return await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash: hash,
        usedAt: null,
        expiresAt: {
          gte: new Date(),
        },
      },
    });
  }

  async markPasswordResetTokenUsed(tokenHash) {
    const hash = crypto.createHash("sha256").update(tokenHash).digest("hex");
    return await prisma.passwordResetToken.updateMany({
      where: { tokenHash: hash },
      data: { usedAt: new Date() },
    });
  }
}

export default new AuthRepository();