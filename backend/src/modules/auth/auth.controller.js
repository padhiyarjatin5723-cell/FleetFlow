import authService from "./auth.service.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sanitizeUser } from "../../utils/sanitize.js";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  logoutAllSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
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

export const refresh = asyncHandler(async (req, res) => {
  const data = refreshSchema.parse(req.body);

  const result = await authService.refreshToken(data.refreshToken);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Token refreshed successfully",
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
  const data = logoutAllSchema.partial().parse(req.body);

  const result = await authService.logoutAll(data.userId || req.user.id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Logged out from all devices",
      result
    )
  );
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const data = forgotPasswordSchema.parse(req.body);

  const result = await authService.requestPasswordReset(data.email);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Password reset requested successfully",
      result
    )
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const data = resetPasswordSchema.parse(req.body);

  const result = await authService.resetPassword(
    data.resetToken,
    data.newPassword
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Password reset successfully",
      result
    )
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = changePasswordSchema.parse(req.body);

  const result = await authService.changePassword(
    req.user.id,
    data.currentPassword,
    data.newPassword
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Password changed successfully",
      result
    )
  );
});

export const me = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      "Current user fetched successfully",
      sanitizeUser(req.user)
    )
  );
});
