import { injectable, inject } from 'inversify';
import Redis from 'ioredis';
import { TYPES } from '../../dependency_injection/types';
import { ILoggerService } from './logger.service';
import { getRedisClient } from '../../database/redis/connection';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
}

@injectable()
export class CacheService implements ICacheService {
  private client: Redis;

  constructor(
    @inject(TYPES.LoggerService) private logger: ILoggerService
  ) {
    // this.client = getRedisClient(); // DISABLED: Redis not required for MVP phase
    this.client = null as any; // No-op placeholder
    this.logger.warn('CacheService: Redis disabled for MVP phase, using no-op implementation');
  }

  async get<T>(key: string): Promise<T | null> {
    // No-op: Redis disabled for MVP phase
    return null; // Simulate cache miss
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    // No-op: Redis disabled for MVP phase
    return;
  }

  async del(key: string): Promise<void> {
    // No-op: Redis disabled for MVP phase
    return;
  }

  async exists(key: string): Promise<boolean> {
    // No-op: Redis disabled for MVP phase
    return false;
  }

  async incr(key: string): Promise<number> {
    // No-op: Redis disabled for MVP phase
    return 0;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    // No-op: Redis disabled for MVP phase
    return false;
  }
}
