import fs from 'fs';
import path from 'path';
import { IAiGradingRepository } from '../../domain/repositories/ai-grading.repository.interface.js';
import { ISubmissionRepository } from '../../../submission/domain/repositories/submission.repository.interface.js';
import { ApiKeyRotatorFacade } from '../../infrastructure/facades/api-key-rotator.facade.js';
import { RagKnowledgeFacade } from '../../infrastructure/facades/rag-knowledge.facade.js';
import { RubricGradingPrompt } from '../../infrastructure/prompts/rubric-grading.prompt.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class GradeSubmissionAiUseCase {
  constructor(
    private readonly aiGradingRepository: IAiGradingRepository,
    private readonly submissionRepository: ISubmissionRepository,
    private readonly apiKeyRotatorFacade: ApiKeyRotatorFacade,
    private readonly ragKnowledgeFacade: RagKnowledgeFacade
  ) {}

  public async execute(submissionId: string) {
    // 1. Lấy thông tin bài nộp
    const submission = await this.submissionRepository.findById(submissionId);

    if (!submission) {
      throw new NotFoundError(`Bài nộp với ID: ${submissionId}`);
    }

    // 2. Đọc mã nguồn từ thư mục workspace của bài nộp
    let studentCode = '// Không tìm thấy mã nguồn';
    if (submission.zipFilePath && fs.existsSync(submission.zipFilePath)) {
      try {
        const files = this.collectSourceFiles(submission.zipFilePath);
        if (files.length > 0) {
          studentCode = files
            .map((f) => `// File: ${path.relative(submission.zipFilePath!, f)}\n${fs.readFileSync(f, 'utf-8')}`)
            .join('\n\n');
        }
      } catch (err: any) {
        console.warn('[GradeSubmissionAiUseCase] Failed to read source files ->', err.message);
      }
    }

    // 3. Lấy RAG context (tiêu chí rubric của thầy, lời giải mẫu, testcase fail)
    const ragContext = await this.ragKnowledgeFacade.getGradingContext(submissionId);
    if (!ragContext) {
      throw new NotFoundError(`Ngữ cảnh bài tập cho bài nộp: ${submissionId}`);
    }

    // 4. Lắp ráp Prompt và gọi AI
    const systemInstruction = RubricGradingPrompt.buildSystemInstruction();
    const prompt = RubricGradingPrompt.buildUserPrompt(studentCode, ragContext);

    const llmResponse = await this.apiKeyRotatorFacade.executeWithKeyRotation(prompt, {
      systemInstruction,
      temperature: 0.1,
      jsonMode: true,
    });

    // 5. Parse kết quả JSON từ LLM
    let parsed: any = {};
    try {
      parsed = JSON.parse(llmResponse.text);
    } catch {
      parsed = {
        detectedTimeComplexity: 'Chưa xác định',
        detectedSpaceComplexity: 'Chưa xác định',
        codeQualityFeedback: llmResponse.text,
        rubricBreakdown: [],
      };
    }

    // 6. Tính tổng điểm AI = Tổng các earnedPoints của từng tiêu chí Rubric
    const rubricBreakdown = (parsed.rubricBreakdown || []).map((r: any) => ({
      rubricId: r.rubricId || 'custom-rubric',
      category: r.category || 'GENERAL',
      title: r.title || 'Tiêu chí',
      earnedPoints: Number(r.earnedPoints || 0),
      maxPoints: Number(r.maxPoints || 0),
      feedback: r.feedback || '',
    }));

    const overallAiScore = Number(
      rubricBreakdown.reduce((sum: number, item: any) => sum + item.earnedPoints, 0).toFixed(2)
    );

    // 7. Lưu kết quả AI Grading vào CSDL
    const savedResult = await this.aiGradingRepository.save({
      submissionId,
      overallAiScore,
      rubricBreakdown,
      detectedTimeComplexity: parsed.detectedTimeComplexity,
      detectedSpaceComplexity: parsed.detectedSpaceComplexity,
      codeQualityFeedback: parsed.codeQualityFeedback || 'Hoàn tất đánh giá.',
      ragContextUsed: {
        rubricCount: ragContext.rubricRules.length,
        failedTestCount: ragContext.failedTestCases.length,
        hasSolution: !!ragContext.solutionSourceCode,
      },
      tokensConsumed: llmResponse.tokensConsumed || 0,
    });

    // 8. Cập nhật finalScore cho submission = sandboxScore + overallAiScore
    const sandboxScore = Number(submission.sandboxScore || 0);
    const finalScore = Number((sandboxScore + overallAiScore).toFixed(2));

    await this.submissionRepository.updateAiGradingScores(submissionId, {
      aiScore: overallAiScore,
      finalScore,
      status: 'GRADED',
      gradedAt: new Date(),
    });

    return {
      submissionId,
      sandboxScore,
      overallAiScore,
      finalScore,
      gradingResult: savedResult.toJSON(),
    };
  }

  private collectSourceFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory() && file !== 'bin' && file !== '__MACOSX') {
        results = results.concat(this.collectSourceFiles(fullPath));
      } else if (file.endsWith('.c') || file.endsWith('.java') || file.endsWith('.cpp')) {
        results.push(fullPath);
      }
    }
    return results;
  }
}
