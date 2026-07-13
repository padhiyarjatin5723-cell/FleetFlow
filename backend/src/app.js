import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import errorHandler from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

// Security
app.use(helmet());

// Enable CORS
app.use(cors());

// Logging
app.use(morgan("dev"));

// Compress Responses
app.use(compression());

// Parse JSON
app.use(express.json());

// Parse URL Encoded Data
app.use(express.urlencoded({ extended: true }));

// Parse Cookies
app.use(cookieParser());

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 FleetFlow Backend Running Successfully",
  });
});

// API Routes
app.use("/api", routes);
app.use(errorHandler);
export default app;