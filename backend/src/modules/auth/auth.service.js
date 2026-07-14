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
}

export default new AuthService();