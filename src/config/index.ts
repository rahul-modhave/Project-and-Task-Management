import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  app: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    secret: process.env.APP_SECRET || 'fallback-secret',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  },
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/collabflow',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access-secret',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  mail: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@collabflow.com',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // Default 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Default 100 requests per window
  },
};
export type Config = typeof config;
