import Redis from 'ioredis';
import { config } from '../../config';

let redisClient: Redis | null = null;

export const initRedis = (): Redis => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: null, // Critical for BullMQ or long running subscriptions
  });

  redisClient.on('connect', () => {
    console.log('Redis connected successfully.');
  });

  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};
