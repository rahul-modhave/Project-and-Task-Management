import { injectable } from 'inversify';
import winston from 'winston';
import { config } from '../../config';

export interface ILoggerService {
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: any, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}

@injectable()
export class LoggerService implements ILoggerService {
  private logger: winston.Logger;

  constructor() {
    const isDevelopment = config.app.env === 'development';

    this.logger = winston.createLogger({
      level: isDevelopment ? 'debug' : 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
              const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
              const stackString = stack ? `\n${stack}` : '';
              return `[${timestamp}] ${level}: ${message} ${metaString} ${stackString}`;
            }),
          ),
        }),
      ],
    });
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: any, meta?: Record<string, any>): void {
    const errorDetails = error instanceof Error ? { stack: error.stack, message: error.message } : error;
    this.logger.error(message, { error: errorDetails, ...meta });
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }
}
