import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import authRepository from "./auth.repository.js";
import ApiError from "../../utils/ApiError.js";
import { env } from "../../config/env.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "./auth.utils.js";

class AuthService {
  async register(data) {
    const existingUser = await authRepository.findUserByEmail(data.email);

    if (existingUser) {
      throw new ApiError(409, "Email already exists");
    }

    const role = await authRepository.findRoleById(data.roleId);

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    const user = await authRepository.createUser({
      fullName: data.fullName,
      email: data.email,
      passwordHash: hashedPassword,
      phone: data.phone,
      roleId: data.roleId,
    });

    const accessToken = generateAccessToken({
      id: user.id,
      role: role.name,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    await authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data) {
    const user = await authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role.name,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
    });

    await authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken) {
    let payload;

    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const storedToken = await authRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await authRepository.findUserById(payload.id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    await authRepository.revokeRefreshToken(refreshToken);

    const newRefreshToken = generateRefreshToken({
      id: user.id,
    });

    await authRepository.saveRefreshToken({
      userId: user.id,
      tokenHash: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: generateAccessToken({
        id: user.id,
        role: user.role.name,
      }),
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken) {
    await authRepository.revokeRefreshToken(refreshToken);

    return {
      message: "Logout successful",
    };
  }

  async logoutAll(userId) {
    await authRepository.revokeAllUserTokens(userId);

    return {
      message: "Logged out from all devices",
    };
  }

  async requestPasswordReset(email) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      return {
        message:
          "If that email exists, a password reset token has been sent.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await authRepository.savePasswordResetToken({
      userId: user.id,
      tokenHash: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    return {
      resetToken,
      expiresIn: 3600,
    };
  }

  async resetPassword(resetToken, newPassword) {
    const resetRecord = await authRepository.findPasswordResetToken(resetToken);

    if (!resetRecord) {
      throw new ApiError(400, "Invalid or expired reset token");
    }

    const user = await authRepository.findUserById(resetRecord.userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    await authRepository.markPasswordResetTokenUsed(resetToken);
    await authRepository.revokeAllUserTokens(user.id);
    await authRepository.updateUserPassword(user.id, hashedPassword);

    return {
      message: "Password has been reset successfully",
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      throw new ApiError(401, "Current password is invalid");
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(env.BCRYPT_SALT_ROUNDS)
    );

    await authRepository.updateUserPassword(userId, hashedPassword);
    await authRepository.revokeAllUserTokens(userId);

    return {
      message: "Password changed successfully",
    };
  }
}

export default new AuthService();