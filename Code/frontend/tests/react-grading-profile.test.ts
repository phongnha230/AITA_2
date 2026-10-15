import { describe, expect, it } from 'vitest';
import { buildReactGradingRubric } from '../src/features/assignments/components/wizard/react-grading-rubric';

describe('FER201 grading profile', () => {
  it('uses structure and Clean Code rubrics instead of an algorithm template', () => {
    const rubric = buildReactGradingRubric(
      'Hooks, state and component boundaries',
      'Naming, readability and maintainability'
    );

    expect(rubric.map((rule) => rule.maxPoints)).toEqual([2, 1]);
    expect(rubric.map((rule) => rule.criterionName)).toEqual([
      'Cấu trúc & kiến trúc React',
      'Clean Code React',
    ]);
    expect(rubric[0]?.description).toContain('Hooks');
    expect(rubric[1]?.description).toContain('maintainability');
  });
});
