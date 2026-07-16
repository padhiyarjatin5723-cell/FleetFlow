import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

const formatZodIssues = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatZodIssues(err.issues),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = err.code === "P2002" ? 409 : 400;
    const message =
      err.code === "P2002"
        ? "A record with the same unique value already exists"
        : "Database request failed";

    return res.status(statusCode).json({
      success: false,
      message,
      code: err.code,
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
