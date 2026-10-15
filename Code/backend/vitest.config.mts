import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    passWithNoTests: false,
    reporters: ['default'],
    testTimeout: 15_000,
    hookTimeout: 60_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage',
    },
  },
});
