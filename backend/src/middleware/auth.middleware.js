import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import authRepository from "../modules/auth/auth.repository.js";
import { env } from "../config/env.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    const user = await authRepository.findUserById(decoded.id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;