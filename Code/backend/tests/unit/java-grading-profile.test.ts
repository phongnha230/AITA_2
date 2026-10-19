import { describe, expect, it } from 'vitest';
import { resolveJavaGradingProfile } from '../../src/modules/ai/domain/java-grading-profile.js';
import { JavaGradingPrompt } from '../../src/modules/ai/infrastructure/prompts/java-grading.prompt.js';

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

describe('Java grading profile instructions', () => {
  it('does not force Big-O grading for PRO192', () => {
    const instruction = new JavaGradingPrompt().buildSystemInstruction(false, 'PRO192');

    expect(instruction).toContain('không tự áp Big-O');
    expect(instruction).toContain('thiết kế hướng đối tượng');
  });

  it('keeps complexity-based evaluation for CSD201', () => {
    const instruction = new JavaGradingPrompt().buildSystemInstruction(false, 'CSD201');

    expect(instruction).toContain('độ phức tạp thuật toán Java');
    expect(instruction).toContain('độ phức tạp kỳ vọng');
  });
});
