import { Request, Response, NextFunction } from 'express';
import { container } from '../dependency_injection/container';
import { TYPES } from '../dependency_injection/types';
import { ILoggerService } from '../services/common/logger.service';

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  let logger: ILoggerService | null = null;
  try {
    logger = container.get<ILoggerService>(TYPES.LoggerService);
  } catch (err) {
    // Fallback if container is not initialized
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (logger) {
      if (res.statusCode >= 500) {
        logger.error(message, null, { ip: req.ip, userAgent: req.headers['user-agent'] });
      } else if (res.statusCode >= 400) {
        logger.warn(message, { ip: req.ip });
      } else {
        logger.info(message);
      }
    } else {
      console.log(message);
    }
  });

  next();
};
