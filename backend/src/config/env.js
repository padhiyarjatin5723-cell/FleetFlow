import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,

  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS),

  NODE_ENV: process.env.NODE_ENV,
};