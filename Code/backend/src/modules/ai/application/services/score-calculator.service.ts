import { RubricEvaluationItem } from '../../domain/entities/ai-grading-result.entity.js';

export class AiScoreCalculator {
  calculate(rubricBreakdown: RubricEvaluationItem[]): number {
    const rawScore = rubricBreakdown.reduce((sum, item) => sum + item.earnedPoints, 0);
    return Number(Math.min(2, Math.max(0, rawScore)).toFixed(2));
  }
}
