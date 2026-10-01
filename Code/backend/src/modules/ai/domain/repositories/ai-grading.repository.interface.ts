import { AiGradingResult, RubricEvaluationItem } from '../entities/ai-grading-result.entity.js';

export interface SaveAiGradingResultData {
  submissionId: string;
  overallAiScore: number;
  rubricBreakdown: RubricEvaluationItem[];
  detectedTimeComplexity?: string | null;
  detectedSpaceComplexity?: string | null;
  codeQualityFeedback: string;
  ragContextUsed?: any;
  tokensConsumed?: number;
}

export interface IAiGradingRepository {
  findBySubmissionId(submissionId: string): Promise<AiGradingResult | null>;
  save(data: SaveAiGradingResultData): Promise<AiGradingResult>;
}
