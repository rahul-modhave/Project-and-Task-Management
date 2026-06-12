export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details: any;

  constructor(statusCode: number, errorCode: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details || null;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errorCode = 'BAD_REQUEST', details?: any) {
    return new AppError(400, errorCode, message, details);
  }

  static unauthorized(message: string, errorCode = 'UNAUTHORIZED', details?: any) {
    return new AppError(401, errorCode, message, details);
  }

  static forbidden(message: string, errorCode = 'FORBIDDEN', details?: any) {
    return new AppError(403, errorCode, message, details);
  }

  static notFound(message: string, errorCode = 'NOT_FOUND', details?: any) {
    return new AppError(404, errorCode, message, details);
  }

  static conflict(message: string, errorCode = 'CONFLICT', details?: any) {
    return new AppError(409, errorCode, message, details);
  }

  static internal(message: string, errorCode = 'INTERNAL_SERVER_ERROR', details?: any) {
    return new AppError(500, errorCode, message, details);
  }
}
