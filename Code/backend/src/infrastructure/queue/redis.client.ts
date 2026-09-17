import Redis from 'ioredis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT) || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined;

export const redisConnection = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redisConnection.on('error', (err) => {
  console.warn('[Redis Client] Warning / Not yet connected:', err.message);
});
