import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors/app-error';
import { ApiResponse } from '../common/response/api-response';
import { container } from '../dependency_injection/container';
import { TYPES } from '../dependency_injection/types';
import { ILoggerService } from '../services/common/logger.service';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let logger: ILoggerService | null = null;
  try {
    logger = container.get<ILoggerService>(TYPES.LoggerService);
  } catch (containerErr) {
    console.error('Could not resolve LoggerService from container:', containerErr);
  }

  const requestId = (req.headers['x-request-id'] as string) || undefined;

  if (err instanceof AppError) {
    if (logger) {
      logger.warn(`AppError [${err.errorCode}]: ${err.message}`, {
        statusCode: err.statusCode,
        details: err.details,
        path: req.path,
        method: req.method,
      });
    } else {
      console.warn(`AppError [${err.errorCode}]: ${err.message}`);
    }

    res.status(err.statusCode).json(
      ApiResponse.error(err.errorCode, err.message, err.details, requestId)
    );
    return;
  }

  // Unhandled errors
  if (logger) {
    logger.error(`Unhandled Exception: ${err.message}`, err, {
      path: req.path,
      method: req.method,
    });
  } else {
    console.error(`Unhandled Exception: ${err.message}`, err);
  }

  res.status(500).json(
    ApiResponse.error(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred on the server.',
      null,
      requestId
    )
  );
};
