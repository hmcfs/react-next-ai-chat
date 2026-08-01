import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis() {
  if (redis) {
    return redis;
  }

  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    keyPrefix: process.env.REDIS_PREFIX || '',
  });

  redis.on('error', (err) => {
    console.error('Redis 连接错误:', err);
  });

  redis.on('connect', () => {
    console.log('Redis 连接成功');
  });

  return redis;
}
