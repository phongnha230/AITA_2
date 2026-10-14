import { describe, expect, it } from 'vitest';
import { executeSandboxSchema } from '../../src/modules/sandbox/application/dtos/sandbox.dto.js';

const validInput = {
  language: 'C_GCC',
  sourceCode: 'int main(void) { return 0; }',
  testCases: [{
    inputData: '',
    expectedOutput: '',
    timeLimitMs: 2_000,
    memoryLimitMb: 256,
    score: 1,
  }],
};

describe('executeSandboxSchema', () => {
  it('accepts values inside server limits', () => {
    expect(executeSandboxSchema.safeParse(validInput).success).toBe(true);
  });

  it.each([
    { testCases: Array.from({ length: 101 }, () => validInput.testCases[0]) },
    { testCases: [{ ...validInput.testCases[0], timeLimitMs: 10_001 }] },
    { testCases: [{ ...validInput.testCases[0], timeLimitMs: 99 }] },
    { testCases: [{ ...validInput.testCases[0], memoryLimitMb: 513 }] },
    { testCases: [{ ...validInput.testCases[0], memoryLimitMb: 31 }] },
  ])('rejects values outside server limits', (patch) => {
    expect(executeSandboxSchema.safeParse({ ...validInput, ...patch }).success).toBe(false);
  });
});
