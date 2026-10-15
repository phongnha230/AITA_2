import { describe, expect, it } from 'vitest';
import { OutputComparator } from '../../src/modules/sandbox/infrastructure/comparator/output-comparator.js';

describe('OutputComparator', () => {
  it('normalizes Windows line endings and trailing whitespace', () => {
    const actual = 'first  \r\nsecond\t\r\n';

    expect(OutputComparator.normalize(actual)).toBe('first\nsecond');
  });

  it('treats normalized output as equal', () => {
    expect(OutputComparator.compare('42\r\n', '42\n')).toBe(true);
  });

  it('detects different output', () => {
    expect(OutputComparator.compare('42', '41')).toBe(false);
  });
});
