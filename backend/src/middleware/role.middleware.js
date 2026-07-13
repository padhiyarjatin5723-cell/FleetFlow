import ApiError from "../utils/ApiError.js";

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (!roles.includes(req.user.role.name)) {
      return next(new ApiError(403, "Forbidden"));
    }

    next();
  };
};

export default roleMiddleware;