import { describe, expect, it } from 'vitest';
import { AiScoreCalculator } from '../../src/modules/ai/application/services/score-calculator.service.js';
import {
  getRagIndexRetryDelay,
  RAG_INDEX_RETRY_DELAYS_MS,
} from '../../src/infrastructure/queue/retry-policy.js';

describe('shared grading policies', () => {
  it('caps the model contribution at two points', () => {
    const calculator = new AiScoreCalculator();
    expect(calculator.calculate([
      { rubricId: 'a', category: 'GENERAL', title: 'A', earnedPoints: 1.2, maxPoints: 2, feedback: 'ok' },
      { rubricId: 'b', category: 'GENERAL', title: 'B', earnedPoints: 1.3, maxPoints: 2, feedback: 'ok' },
    ])).toBe(2);
    expect(calculator.calculate([])).toBe(0);
  });

  it('uses the approved RAG indexing retry schedule and clamps out-of-range attempts', () => {
    expect(Array.from(RAG_INDEX_RETRY_DELAYS_MS)).toEqual([10_000, 30_000, 120_000, 300_000, 900_000]);
    expect(getRagIndexRetryDelay(1)).toBe(10_000);
    expect(getRagIndexRetryDelay(5)).toBe(900_000);
    expect(getRagIndexRetryDelay(99)).toBe(900_000);
    expect(getRagIndexRetryDelay(0)).toBe(10_000);
  });
});
