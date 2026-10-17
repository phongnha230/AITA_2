import { describe, expect, it } from 'vitest';
import { getWebAssertionPoints, parseWebTestScript } from '../../src/modules/sandbox/domain/web-test-script.js';

describe('web testcase assertion scoring', () => {
  it('splits a flow score across assertions and assigns rounding remainder to the last', () => {
    const awards = [0, 1, 2].map((index) => getWebAssertionPoints(1, 3, index));

    expect(awards).toEqual([0.33, 0.33, 0.34]);
    expect(awards.reduce((sum, points) => sum + points, 0)).toBe(1);
  });

  it('returns zero when an assertion does not exist', () => {
    expect(getWebAssertionPoints(2, 0, -1)).toBe(0);
    expect(getWebAssertionPoints(2, 1, 1)).toBe(0);
  });

  it('parses assertion steps as part of the configured web flow', () => {
    const steps = parseWebTestScript(JSON.stringify({ version: 1, steps: [
      { action: 'GOTO', target: '/products' },
      { action: 'ASSERT_TEXT', target: '[data-testid="title"]', expected: 'Products' },
    ] }));

    expect(steps.filter((step) => step.action.startsWith('ASSERT_'))).toHaveLength(1);
  });
});
