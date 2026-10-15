import { IAiGradingRepository } from '../../domain/repositories/ai-grading.repository.interface.js';
import { ISubmissionRepository } from '../../../submission/domain/repositories/submission.repository.interface.js';
import { IAiGenerationService } from '../services/ai-generation.service.interface.js';
import { IRagKnowledgeService } from '../services/rag-knowledge.service.interface.js';
import { RubricGradingPrompt } from '../../infrastructure/prompts/rubric-grading.prompt.js';
import { AppError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { SourceCollector } from '../services/source-collector.service.js';
import { AiGradingOutputService, ValidatedGradingOutput } from '../services/ai-grading-output.service.js';
import { FeedbackLeakageService } from '../services/feedback-leakage.service.js';

export class GradeSubmissionAiUseCase {
  constructor(
    private readonly aiGradingRepository: IAiGradingRepository,
    private readonly submissionRepository: ISubmissionRepository,
    private readonly aiGenerationService: IAiGenerationService,
    private readonly ragKnowledgeService: IRagKnowledgeService,
    private readonly sourceCollector = new SourceCollector(),
    private readonly gradingOutputService = new AiGradingOutputService(),
    private readonly leakageService = new FeedbackLeakageService()
  ) {}

  public async execute(submissionId: string) {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) throw new NotFoundError(`Bài nộp với ID: ${submissionId}`);
    if (!submission.zipFilePath) throw new ValidationError('Submission chưa có thư mục source để chấm AI.');

    const collectedSource = await this.sourceCollector.collect(submission.zipFilePath);
    if (collectedSource.files.length === 0) {
      throw new ValidationError('Submission không có source .c, .h hoặc .java hợp lệ.');
    }

    const ragContext = await this.ragKnowledgeService.getGradingContext(
      submissionId,
      collectedSource.combinedSource
    );
    const prompt = RubricGradingPrompt.buildUserPrompt(collectedSource.combinedSource, ragContext);

    let tokensConsumed = 0;
    let gradingOutput: ValidatedGradingOutput | null = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const llmResponse = await this.aiGenerationService.executeWithKeyRotation(prompt, {
        operation: 'GRADING_GENERATION',
        systemInstruction: RubricGradingPrompt.buildSystemInstruction(attempt === 1),
        temperature: 0.1,
        jsonMode: true,
      });
      tokensConsumed += llmResponse.tokensConsumed ?? 0;
      gradingOutput = this.gradingOutputService.validateAndScore(
        llmResponse.text,
        ragContext.rubricRules
      );

      const feedback = [
        gradingOutput.codeQualityFeedback,
        ...gradingOutput.rubricBreakdown.map((item) => item.feedback),
      ].join('\n');
      if (!this.leakageService.detectsLeakage(feedback, ragContext.referenceSolutionSource)) break;
      gradingOutput = null;
    }

    if (!gradingOutput) {
      throw new AppError(
        'AI feedback vẫn chứa nội dung giống lời giải sau lần retry an toàn.',
        422,
        'AI_FEEDBACK_LEAKAGE'
      );
    }

    const ragContextUsed = ragContext.relevantSolutionChunks.map((chunk) => ({
      chunkId: chunk.id,
      symbol: chunk.symbol,
      similarity: chunk.similarity,
      embeddingModel: chunk.embeddingModel,
      chunkerVersion: chunk.chunkerVersion,
    }));
    const savedResult = await this.aiGradingRepository.save({
      submissionId,
      overallAiScore: gradingOutput.overallAiScore,
      rubricBreakdown: gradingOutput.rubricBreakdown,
      detectedTimeComplexity: gradingOutput.detectedTimeComplexity,
      detectedSpaceComplexity: gradingOutput.detectedSpaceComplexity,
      codeQualityFeedback: gradingOutput.codeQualityFeedback,
      ragContextUsed,
      tokensConsumed,
    });

    const sandboxScore = Number(submission.sandboxScore ?? 0);
    const finalScore = Number(Math.min(10, Math.max(0, sandboxScore + gradingOutput.overallAiScore)).toFixed(2));
    await this.submissionRepository.updateAiGradingScores(submissionId, {
      aiScore: gradingOutput.overallAiScore,
      finalScore,
      status: 'GRADED',
      gradedAt: new Date(),
    });

    return {
      submissionId,
      sandboxScore,
      overallAiScore: gradingOutput.overallAiScore,
      finalScore,
      gradingResult: savedResult.toJSON(),
    };
  }
}
