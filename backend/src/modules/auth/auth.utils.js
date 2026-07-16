import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

// Hash Password
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Compare Password
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate Access Token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });
};