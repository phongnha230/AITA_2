import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';
import { CHUNKER_VERSION } from '../chunking/code-chunker.js';
import { ISolutionVectorStore } from '../vector/chroma-vector.service.js';
import { IRagContextRepository } from '../../domain/repositories/rag-context.repository.interface.js';
import {
  IRagKnowledgeService,
  RagContext,
} from '../../application/services/rag-knowledge.service.interface.js';

export class RagUnavailableError extends AppError {
  constructor(message = 'RAG chưa sẵn sàng cho bài tập này.') {
    super(message, 503, 'AI_RAG_UNAVAILABLE');
  }
}

export class RagKnowledgeFacade implements IRagKnowledgeService {
  constructor(
    private readonly ragContextRepository: IRagContextRepository,
    private readonly vectorStore: ISolutionVectorStore
  ) {}

  async getGradingContext(submissionId: string, studentCode: string): Promise<RagContext> {
    if (!env.AI_GRADING_REQUIRE_READY_RAG) {
      throw new RagUnavailableError(
        'AI grading đang tắt cho tới khi backfill RAG hoàn tất và AI_GRADING_REQUIRE_READY_RAG=true.'
      );
    }
    const submission = await this.ragContextRepository.findSubmissionContext(submissionId);
    if (!submission) throw new RagUnavailableError('Không tìm thấy submission để dựng RAG context.');

    const assignment = submission.assignment;
    const solution = assignment.activeSolution;
    if (
      !solution ||
      solution.activeKey !== assignment.id ||
      solution.indexStatus !== 'READY' ||
      solution.embeddingModel !== env.GEMINI_EMBEDDING_MODEL ||
      solution.chunkerVersion !== CHUNKER_VERSION
    ) {
      throw new RagUnavailableError();
    }

    const failedTestCases = submission.testResults
      .filter((testResult) => testResult.verdict !== 'PASSED')
      .map((testResult) => ({
        label: testResult.testCase.label,
        rationaleTag: testResult.testCase.rationaleTag,
        verdict: testResult.verdict,
        actualStdout: testResult.actualStdout,
        diffLog: testResult.diffLog,
      }));

    const queryText = [
      `Assignment: ${assignment.title}`,
      `Description: ${assignment.description ?? ''}`,
      `Language: ${assignment.environment}`,
      `Expected time complexity: ${solution.expectedTimeComplexity ?? ''}`,
      `Expected space complexity: ${solution.expectedSpaceComplexity ?? ''}`,
      `Accepted strategies: ${JSON.stringify(solution.acceptedStrategies ?? [])}`,
      `Algorithm grading notes: ${solution.algorithmNotes ?? ''}`,
      `Compiler error: ${submission.compileOutput ?? ''}`,
      `Failed tests: ${failedTestCases.map((test) =>
        `${test.label} ${test.rationaleTag} ${test.verdict} ${test.diffLog ?? test.actualStdout ?? ''}`
      ).join('\n')}`,
      `Student source excerpt: ${studentCode.slice(0, 4_096)}`,
    ].join('\n').slice(0, 8_192);

    let relevantSolutionChunks;
    try {
      relevantSolutionChunks = await this.vectorStore.queryRelevantChunks({
        assignmentId: assignment.id,
        solutionId: solution.id,
        contentHash: solution.contentHash,
        environment: assignment.environment,
        embeddingModel: solution.embeddingModel,
        chunkerVersion: solution.chunkerVersion,
      }, queryText);
    } catch (error) {
      throw new RagUnavailableError(
        error instanceof Error ? `RAG retrieval thất bại: ${error.message}` : undefined
      );
    }
    if (relevantSolutionChunks.length === 0) {
      throw new RagUnavailableError('Không có RAG chunk nào đạt similarity tối thiểu 0.70.');
    }

    return {
      assignmentTitle: assignment.title,
      assignmentDescription: assignment.description,
      environment: assignment.environment,
      algorithmSpecification: {
        expectedTimeComplexity: solution.expectedTimeComplexity,
        expectedSpaceComplexity: solution.expectedSpaceComplexity,
        acceptedStrategies: Array.isArray(solution.acceptedStrategies)
          ? solution.acceptedStrategies.filter((item): item is string => typeof item === 'string')
          : [],
        notes: solution.algorithmNotes,
      },
      referenceSolutionSource: solution.sourceCode,
      relevantSolutionChunks,
      rubricRules: assignment.rubricRules.map((rule) => ({
        id: rule.id,
        criterionName: rule.criterionName,
        description: rule.description,
        maxPoints: Number(rule.maxPoints),
        weight: Number(rule.weight),
        criterionType: rule.criterionType,
      })),
      failedTestCases,
    };
  }
}
