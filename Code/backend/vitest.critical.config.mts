import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'tests/unit/refresh-token.use-case.test.ts',
      'tests/unit/assignment-access.policy.test.ts',
      'tests/unit/git-ingestion-security.test.ts',
      'tests/unit/zip-extractor-security.test.ts',
      'tests/unit/ai-grading-output.test.ts',
      'tests/unit/feedback-leakage.test.ts',
      'tests/unit/source-collector.test.ts',
      'tests/unit/code-chunker.test.ts',
      'tests/unit/retry-and-score-policy.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage/critical',
      include: [
        'src/modules/auth/application/use-cases/refresh-token.use-case.ts',
        'src/modules/assignment/infrastructure/policies/prisma-assignment-access.policy.ts',
        'src/modules/submission/infrastructure/storage/github-url.validator.ts',
        'src/modules/submission/infrastructure/storage/zip-extractor.service.ts',
        'src/modules/ai/application/services/ai-grading-output.service.ts',
        'src/modules/ai/application/services/feedback-leakage.service.ts',
        'src/modules/ai/application/services/source-collector.service.ts',
        'src/modules/ai/infrastructure/chunking/code-chunker.ts',
        'src/modules/ai/application/services/score-calculator.service.ts',
        'src/infrastructure/queue/retry-policy.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
