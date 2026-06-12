import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { TYPES } from '../../dependency_injection/types';
import { ILoggerService } from './logger.service';

export interface ITokenService {
  generateAccessToken(payload: { userId: string; email: string }): string;
  generateRefreshToken(payload: { userId: string }): string;
  verifyAccessToken(token: string): { userId: string; email: string };
  verifyRefreshToken(token: string): { userId: string };
}

@injectable()
export class TokenService implements ITokenService {
  constructor(
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {}

  generateAccessToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiration as any,
    });
  }

  generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiration as any,
    });
  }

  verifyAccessToken(token: string): { userId: string; email: string } {
    try {
      return jwt.verify(token, config.jwt.accessSecret) as { userId: string; email: string };
    } catch (err) {
      this.logger.debug('Access token verification failed', { error: err });
      throw err;
    }
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
    } catch (err) {
      this.logger.debug('Refresh token verification failed', { error: err });
      throw err;
    }
  }
}
