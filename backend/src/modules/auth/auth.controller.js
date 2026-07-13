import authService from "./auth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  registerSchema,
  loginSchema,
  logoutSchema,
} from "./auth.validator.js";

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const result = await authService.register(data);

  return res.status(201).json(
    new ApiResponse(
      201,
      "User registered successfully",
      result
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const result = await authService.login(data);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Login successful",
      result
    )
  );
});

export const logout = asyncHandler(async (req, res) => {
  const data = logoutSchema.parse(req.body);

  const result = await authService.logout(data.refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Logout successful",
      result
    )
  );
});

export const logoutAll = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const result = await authService.logoutAll(userId);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Logged out from all devices",
      result
    )
  );
});

export const me = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      "Current user fetched successfully",
      req.user
    )
  );
});