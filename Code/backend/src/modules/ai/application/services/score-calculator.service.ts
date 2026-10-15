import { RubricEvaluationItem } from '../../domain/entities/ai-grading-result.entity.js';

export class AiScoreCalculator {
  calculate(rubricBreakdown: RubricEvaluationItem[]): number {
    const hasSplitRubric = rubricBreakdown.some(
      (item) => item.category === 'ALGORITHM' || item.category === 'CLEAN_CODE'
    );
    if (!hasSplitRubric) {
      const generalScore = rubricBreakdown
        .filter((item) => item.category === 'GENERAL')
        .reduce((sum, item) => sum + item.earnedPoints, 0);
      return Number(Math.min(2, Math.max(0, generalScore)).toFixed(2));
    }
    return Number((
      this.calculateCategory(rubricBreakdown, 'ALGORITHM', 2)
      + this.calculateCategory(rubricBreakdown, 'CLEAN_CODE', 1)
    ).toFixed(2));
  }

  calculateCategory(
    rubricBreakdown: RubricEvaluationItem[],
    category: 'ALGORITHM' | 'CLEAN_CODE',
    maxScore: number
  ): number {
    const rawScore = rubricBreakdown
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.earnedPoints, 0);
    return Number(Math.min(maxScore, Math.max(0, rawScore)).toFixed(2));
  }
}
