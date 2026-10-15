import { describe, expect, it } from 'vitest';
import { resolveJavaGradingProfile } from '../../src/modules/ai/domain/java-grading-profile.js';

describe('resolveJavaGradingProfile', () => {
  it.each([
    ['PRO192', 'PRO_OOP'],
    [' pro192 ', 'PRO_OOP'],
    ['CSD201', 'CSD_ALGORITHM'],
    ['csd201', 'CSD_ALGORITHM'],
    ['SWD392', 'JAVA_GENERAL'],
    ['', 'JAVA_GENERAL'],
    [null, 'JAVA_GENERAL'],
    [undefined, 'JAVA_GENERAL'],
  ] as const)('maps course code %s to %s', (courseCode, expectedProfile) => {
    expect(resolveJavaGradingProfile(courseCode)).toBe(expectedProfile);
  });
});
