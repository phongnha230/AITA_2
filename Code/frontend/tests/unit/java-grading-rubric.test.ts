import { describe, expect, it } from 'vitest';
import { buildJavaGradingRubric } from '../../src/features/assignments/components/wizard/java-grading-rubric';

describe('buildJavaGradingRubric', () => {
  it('uses OOP design criteria for PRO192 instead of requiring Big-O', () => {
    const rubric = buildJavaGradingRubric('PRO192', '', '');

    expect(rubric[0]?.criterionName).toContain('hướng đối tượng');
    expect(rubric[0]?.description).toContain('PRO192');
    expect(rubric[0]?.description).not.toContain('chưa cấu hình');
    expect(rubric[1]?.criterionName).toContain('OOP');
  });

  it('keeps algorithm complexity criteria for CSD201', () => {
    const rubric = buildJavaGradingRubric('CSD201', 'O(n log n)', 'O(n)');

    expect(rubric[0]?.description).toContain('O(n log n)');
    expect(rubric[0]?.description).toContain('O(n)');
    expect(rubric[0]?.description).toContain('cấu trúc dữ liệu');
  });
});
