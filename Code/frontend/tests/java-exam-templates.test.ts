import { describe, expect, it } from 'vitest';
import { sampleCsd201Template, samplePro192Template } from '../src/features/assignments/components/wizard/sampleExamTemplates';
import { buildJavaGradingRubric } from '../src/features/assignments/components/wizard/java-grading-rubric';

describe('Java course PE templates', () => {
  it('keeps PRO192 and CSD201 as distinct Java templates', () => {
    expect(samplePro192Template.environment).toBe('JAVA_JDK');
    expect(sampleCsd201Template.environment).toBe('JAVA_JDK');
    expect(samplePro192Template.title).toContain('PRO192');
    expect(sampleCsd201Template.title).toContain('CSD201');
    expect(samplePro192Template.title).not.toContain('CSD201');
    expect(sampleCsd201Template.title).not.toContain('PRO192');
    expect(samplePro192Template.description).toContain('Hướng đối tượng');
    expect(sampleCsd201Template.description).toContain('cấu trúc dữ liệu mảng');
    expect(sampleCsd201Template.algorithmNotes).toContain('Profile CSD201');
  });

  it.each([samplePro192Template, sampleCsd201Template])('keeps the functional test budget at 7 points for $title', (template) => {
    const testcasePoints = template.testCases.reduce((total, testCase) => total + testCase.points, 0);
    expect(testcasePoints).toBe(7);
  });

  it('builds course-specific rubric descriptions without changing the 2 + 1 point contract', () => {
    const proRubric = buildJavaGradingRubric('PRO192', 'O(n log n)', 'O(n)');
    const csdRubric = buildJavaGradingRubric(' CSD201 ', 'O(n log n)', 'O(n)');

    expect(proRubric.map((rule) => rule.maxPoints)).toEqual([2, 1]);
    expect(csdRubric.map((rule) => rule.maxPoints)).toEqual([2, 1]);
    expect(proRubric[1]?.description).toContain('encapsulation');
    expect(csdRubric[0]?.description).toContain('cấu trúc dữ liệu');
    expect(csdRubric[1]?.description).toContain('không yêu cầu thiết kế OOP');
    expect(csdRubric.map((rule) => rule.criterionType)).toEqual(['ALGORITHM', 'CLEAN_CODE']);
  });
});
