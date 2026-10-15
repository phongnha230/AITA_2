import { describe, expect, it } from 'vitest';
import { AiGradingOutputService } from '../../src/modules/ai/application/services/ai-grading-output.service.js';

const rubricRules = [{
  id: 'rubric-1',
  criterionName: 'Correctness',
  description: 'Correct result',
  maxPoints: 3,
  weight: 1,
  criterionType: 'GENERAL' as const,
}];

const validOutput = {
  rubricBreakdown: [{ rubricId: 'rubric-1', earnedPoints: 2.5, feedback: 'Tốt.' }],
  detectedTimeComplexity: 'O(n)',
  detectedSpaceComplexity: 'O(1)',
  codeQualityFeedback: 'Cấu trúc rõ ràng.',
};

describe('AiGradingOutputService', () => {
  const service = new AiGradingOutputService();

  it('uses trusted rubric metadata and caps the AI score at 2.0', () => {
    const result = service.validateAndScore(JSON.stringify(validOutput), rubricRules);
    expect(result.overallAiScore).toBe(2);
    expect(result.rubricBreakdown[0]).toMatchObject({
      rubricId: 'rubric-1',
      title: 'Correctness',
      maxPoints: 3,
    });
  });

  it.each([
    { ...validOutput, rubricBreakdown: [{ ...validOutput.rubricBreakdown[0], rubricId: 'unknown' }] },
    { ...validOutput, rubricBreakdown: [validOutput.rubricBreakdown[0], validOutput.rubricBreakdown[0]] },
    { ...validOutput, rubricBreakdown: [{ ...validOutput.rubricBreakdown[0], earnedPoints: 4 }] },
    { ...validOutput, rubricBreakdown: [{ ...validOutput.rubricBreakdown[0], earnedPoints: -1 }] },
  ])('rejects untrusted or invalid rubric scores', (payload) => {
    expect(() => service.validateAndScore(JSON.stringify(payload), rubricRules)).toThrow();
  });

  it('rejects prompt-injected extra output fields', () => {
    expect(() => service.validateAndScore(JSON.stringify({ ...validOutput, finalScore: 10 }), rubricRules))
      .toThrow();
  });

  it('rejects malformed JSON and missing rubric rows', () => {
    expect(() => service.validateAndScore('{not-json', rubricRules)).toThrow();
    expect(() => service.validateAndScore(JSON.stringify({
      ...validOutput,
      rubricBreakdown: [],
    }), rubricRules)).toThrow();
  });

  it('keeps algorithm and Clean Code scores within their separate 2+1 point caps', () => {
    const splitRules = [
      { ...rubricRules[0], id: 'algorithm', maxPoints: 2, criterionType: 'ALGORITHM' as const },
      { ...rubricRules[0], id: 'clean-code', maxPoints: 1, criterionType: 'CLEAN_CODE' as const },
    ];
    const output = {
      ...validOutput,
      rubricBreakdown: [
        { rubricId: 'algorithm', earnedPoints: 1.8, feedback: 'Độ phức tạp phù hợp.' },
        { rubricId: 'clean-code', earnedPoints: 0.8, feedback: 'Cấu trúc khá rõ.' },
      ],
    };

    const result = service.validateAndScore(JSON.stringify(output), splitRules);
    expect(result).toMatchObject({ overallAiScore: 2.6, algorithmScore: 1.8, cleanCodeScore: 0.8 });
    expect(result.rubricBreakdown.map((item) => item.category)).toEqual(['ALGORITHM', 'CLEAN_CODE']);
  });
});
