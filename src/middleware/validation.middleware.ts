import { Request, Response, NextFunction, RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { AppError } from '../common/errors/app-error';

const formatValidationErrors = (errors: ValidationError[]): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  
  const extractErrors = (errorList: ValidationError[], prefix = '') => {
    for (const error of errorList) {
      const fieldPath = prefix ? `${prefix}.${error.property}` : error.property;
      if (error.constraints) {
        result[fieldPath] = Object.values(error.constraints);
      }
      if (error.children && error.children.length > 0) {
        extractErrors(error.children, fieldPath);
      }
    }
  };

  extractErrors(errors);
  return result;
};

export const validationMiddleware = (
  type: any,
  value: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsedInstance = plainToInstance(type, req[value]);
      const errors = await validate(parsedInstance as object, {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false },
      });

      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        next(AppError.badRequest('Validation failed', 'VALIDATION_FAILED', formattedErrors));
        return;
      }

      req[value] = parsedInstance;
      next();
    } catch (err) {
      next(err);
    }
  };
};
