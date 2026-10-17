import { z } from 'zod';
import { RubricEvaluationItem } from '../../domain/entities/ai-grading-result.entity.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { AiScoreCalculator } from './score-calculator.service.js';

export interface GradingRubricRule {
  id: string;
  criterionName: string;
  description: string;
  maxPoints: number;
  weight: number;
  criterionType?: 'GENERAL' | 'ALGORITHM' | 'CLEAN_CODE';
}

const gradingOutputSchema = z.object({
  answerComparison: z.string().max(4_000).optional(),
  rubricBreakdown: z.array(z.object({
    rubricId: z.string().min(1),
    earnedPoints: z.number().finite().min(0),
    feedback: z.string().min(1).max(4_000),
  }).strict()).max(100),
  detectedTimeComplexity: z.string().max(100).optional(),
  detectedSpaceComplexity: z.string().max(100).optional(),
  codeQualityFeedback: z.string().min(1).max(12_000),
}).strict();

export interface ValidatedGradingOutput {
  answerComparison?: string;
  rubricBreakdown: RubricEvaluationItem[];
  overallAiScore: number;
  algorithmScore: number | null;
  cleanCodeScore: number | null;
  detectedTimeComplexity?: string;
  detectedSpaceComplexity?: string;
  codeQualityFeedback: string;
}

export class AiGradingOutputService {
  constructor(private readonly scoreCalculator = new AiScoreCalculator()) {}

  validateAndScore(rawText: string, rubricRules: GradingRubricRule[]): ValidatedGradingOutput {
    let json: unknown;
    try {
      json = JSON.parse(rawText);
    } catch (error) {
      throw new ValidationError('AI trả về JSON không hợp lệ.', {
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const parsed = gradingOutputSchema.safeParse(json);
    if (!parsed.success) {
      throw new ValidationError('AI trả về payload chấm điểm không đúng schema.', parsed.error.flatten());
    }

    const rubricById = new Map(rubricRules.map((rubric) => [rubric.id, rubric]));
    const seenIds = new Set<string>();
    const rubricBreakdown = parsed.data.rubricBreakdown.map((item): RubricEvaluationItem => {
      const rubric = rubricById.get(item.rubricId);
      if (!rubric) throw new ValidationError(`AI trả về rubricId không tồn tại: ${item.rubricId}`);
      if (seenIds.has(item.rubricId)) throw new ValidationError(`AI trả về rubricId trùng lặp: ${item.rubricId}`);
      if (item.earnedPoints > rubric.maxPoints) {
        throw new ValidationError(`Điểm rubric ${item.rubricId} vượt quá maxPoints.`);
      }
      seenIds.add(item.rubricId);
      return {
        rubricId: rubric.id,
        category: rubric.criterionType ?? 'GENERAL',
        title: rubric.criterionName,
        earnedPoints: item.earnedPoints,
        maxPoints: rubric.maxPoints,
        feedback: item.feedback,
      };
    });

    if (seenIds.size !== rubricRules.length) {
      throw new ValidationError('AI không trả về đầy đủ các rubric được yêu cầu.');
    }

    const hasSplitRubric = rubricBreakdown.some(
      (item) => item.category === 'ALGORITHM' || item.category === 'CLEAN_CODE'
    );
    return {
      answerComparison: parsed.data.answerComparison,
      rubricBreakdown,
      overallAiScore: this.scoreCalculator.calculate(rubricBreakdown),
      algorithmScore: hasSplitRubric ? this.scoreCalculator.calculateCategory(rubricBreakdown, 'ALGORITHM', 2) : null,
      cleanCodeScore: hasSplitRubric ? this.scoreCalculator.calculateCategory(rubricBreakdown, 'CLEAN_CODE', 1) : null,
      detectedTimeComplexity: parsed.data.detectedTimeComplexity,
      detectedSpaceComplexity: parsed.data.detectedSpaceComplexity,
      codeQualityFeedback: parsed.data.codeQualityFeedback,
    };
  }
}
