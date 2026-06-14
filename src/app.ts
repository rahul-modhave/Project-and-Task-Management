import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './modules/auth/route/auth.route';
import taskRoutes from './modules/task/route/task.route';
import projectRoutes from './modules/project/route/project.route';
import dashboardRoutes from './modules/dashboard/route/dashboard.route';
import healthRoutes from './modules/health/route/health.route';
import userRoutes from './modules/user/route/user.route';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { ApiResponse } from './common/response/api-response';

const app = express();

// Set security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.app.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Workspace-ID'],
  })
);

// Gzip compression
app.use(compression());

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming API requests
app.use(loggingMiddleware);

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next) => {
    const requestId = req.headers['x-request-id'] as string | undefined;
    res
      .status(429)
      .json(
        ApiResponse.error('TOO_MANY_REQUESTS', 'Too many requests, please try again later.', null, requestId)
      );
  },
});
app.use('/api/', limiter);

// Mount API Routes
app.use(`${config.app.apiPrefix}/auth`, authRoutes);
app.use(`${config.app.apiPrefix}/projects`, projectRoutes);
app.use(`${config.app.apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${config.app.apiPrefix}/tasks`, taskRoutes);
app.use(`${config.app.apiPrefix}/health`, healthRoutes);
app.use(`${config.app.apiPrefix}/users`, userRoutes);

// Swagger/OpenAPI Dummy Endpoint (Fleshed out in Swagger Setup)
app.use('/docs', (_req, res) => {
  res.send(`
    <html>
      <head><title>CollabFlow API documentation</title></head>
      <body style="font-family: sans-serif; padding: 40px; background: #0f172a; color: #f8fafc;">
        <h1>CollabFlow API Documentation Sandbox</h1>
        <p>This endpoint represents the Swagger/OpenAPI UI integration for verification.</p>
        <ul>
          <li><b>Auth:</b> /api/v1/auth/signup, /api/v1/auth/login, /api/v1/auth/me</li>
          <li><b>Tasks:</b> /api/v1/tasks/, /api/v1/tasks/project/:projectId</li>
        </ul>
      </body>
    </html>
  `);
});

// Global exception catcher (must be registered last)
app.use(errorMiddleware);

export default app;
