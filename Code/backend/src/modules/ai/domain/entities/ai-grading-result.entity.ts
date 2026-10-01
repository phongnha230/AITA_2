export interface RubricEvaluationItem {
  rubricId: string;
  category: string;
  title: string;
  earnedPoints: number;
  maxPoints: number;
  feedback: string;
}

export interface AiGradingResultProps {
  id: string;
  submissionId: string;
  overallAiScore: number;
  rubricBreakdown: RubricEvaluationItem[];
  detectedTimeComplexity?: string | null;
  detectedSpaceComplexity?: string | null;
  codeQualityFeedback: string;
  ragContextUsed?: any;
  tokensConsumed?: number;
  evaluatedAt: Date;
}

export class AiGradingResult {
  constructor(private readonly props: AiGradingResultProps) {}

  get id(): string {
    return this.props.id;
  }

  get submissionId(): string {
    return this.props.submissionId;
  }

  get overallAiScore(): number {
    return this.props.overallAiScore;
  }

  get rubricBreakdown(): RubricEvaluationItem[] {
    return this.props.rubricBreakdown;
  }

  get detectedTimeComplexity(): string | null | undefined {
    return this.props.detectedTimeComplexity;
  }

  get detectedSpaceComplexity(): string | null | undefined {
    return this.props.detectedSpaceComplexity;
  }

  get codeQualityFeedback(): string {
    return this.props.codeQualityFeedback;
  }

  get ragContextUsed(): any {
    return this.props.ragContextUsed;
  }

  get tokensConsumed(): number {
    return this.props.tokensConsumed || 0;
  }

  get evaluatedAt(): Date {
    return this.props.evaluatedAt;
  }

  toJSON() {
    return {
      id: this.props.id,
      submissionId: this.props.submissionId,
      overallAiScore: this.props.overallAiScore,
      rubricBreakdown: this.props.rubricBreakdown,
      detectedTimeComplexity: this.props.detectedTimeComplexity,
      detectedSpaceComplexity: this.props.detectedSpaceComplexity,
      codeQualityFeedback: this.props.codeQualityFeedback,
      ragContextUsed: this.props.ragContextUsed,
      tokensConsumed: this.props.tokensConsumed || 0,
      evaluatedAt: this.props.evaluatedAt,
    };
  }
}
