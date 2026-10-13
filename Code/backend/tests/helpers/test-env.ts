const TEST_SECRET = 'test-secret-at-least-32-characters';

export const configureTestEnvironment = (): void => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL ??= 'mysql://root:root@127.0.0.1:3306/aita_test';
  process.env.REDIS_HOST ??= '127.0.0.1';
  process.env.REDIS_PORT ??= '6379';
  process.env.JWT_SECRET ??= TEST_SECRET;
  process.env.JWT_REFRESH_SECRET ??= `${TEST_SECRET}-refresh`;
  process.env.USE_DOCKER_SANDBOX ??= 'false';
};
