import { AiGradingResult as PrismaAiGradingResult, Prisma, PrismaClient } from '@prisma/client';
import {
  IAiGradingRepository,
  SaveAiGradingResultData,
} from '../../domain/repositories/ai-grading.repository.interface.js';
import {
  AiGradingResult,
  RagContextReference,
  RubricEvaluationItem,
} from '../../domain/entities/ai-grading-result.entity.js';

export class PrismaAiGradingRepository implements IAiGradingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: PrismaAiGradingResult): AiGradingResult {
    return new AiGradingResult({
      id: raw.id,
      submissionId: raw.submissionId,
      overallAiScore: Number(raw.overallAiScore),
      rubricBreakdown: (raw.rubricBreakdownJson as unknown as RubricEvaluationItem[]) || [],
      detectedTimeComplexity: raw.detectedTimeComplexity,
      detectedSpaceComplexity: raw.detectedSpaceComplexity,
      codeQualityFeedback: raw.codeQualityFeedback,
      ragContextUsed: (raw.ragContextUsed as unknown as RagContextReference[] | null) ?? undefined,
      tokensConsumed: raw.tokensConsumed,
      evaluatedAt: raw.evaluatedAt,
    });
  }

  async findBySubmissionId(submissionId: string): Promise<AiGradingResult | null> {
    const raw = await this.prisma.aiGradingResult.findUnique({
      where: { submissionId },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async save(data: SaveAiGradingResultData): Promise<AiGradingResult> {
    const raw = await this.prisma.aiGradingResult.upsert({
      where: { submissionId: data.submissionId },
      create: {
        submissionId: data.submissionId,
        overallAiScore: data.overallAiScore,
        rubricBreakdownJson: data.rubricBreakdown as unknown as Prisma.InputJsonValue,
        detectedTimeComplexity: data.detectedTimeComplexity ?? null,
        detectedSpaceComplexity: data.detectedSpaceComplexity ?? null,
        codeQualityFeedback: data.codeQualityFeedback,
        ragContextUsed: data.ragContextUsed
          ? data.ragContextUsed as unknown as Prisma.InputJsonValue
          : Prisma.JsonNull,
        tokensConsumed: data.tokensConsumed ?? 0,
      },
      update: {
        overallAiScore: data.overallAiScore,
        rubricBreakdownJson: data.rubricBreakdown as unknown as Prisma.InputJsonValue,
        detectedTimeComplexity: data.detectedTimeComplexity ?? null,
        detectedSpaceComplexity: data.detectedSpaceComplexity ?? null,
        codeQualityFeedback: data.codeQualityFeedback,
        ragContextUsed: data.ragContextUsed
          ? data.ragContextUsed as unknown as Prisma.InputJsonValue
          : Prisma.JsonNull,
        tokensConsumed: data.tokensConsumed ?? 0,
        evaluatedAt: new Date(),
      },
    });

    return this.toDomain(raw);
  }
}
