import prisma from '../../../../infrastructure/database/prisma.client.js';
import { env } from '../../../../infrastructure/config/env.js';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';
import { CHUNKER_VERSION } from '../chunking/code-chunker.js';
import {
  ChromaVectorService,
  RetrievedSolutionChunk,
} from '../vector/chroma-vector.service.js';

export class RagUnavailableError extends AppError {
  constructor(message = 'RAG chưa sẵn sàng cho bài tập này.') {
    super(message, 503, 'AI_RAG_UNAVAILABLE');
  }
}

export interface RagContext {
  assignmentTitle: string;
  assignmentDescription: string | null;
  environment: string;
  referenceSolutionSource: string;
  relevantSolutionChunks: RetrievedSolutionChunk[];
  rubricRules: Array<{
    id: string;
    criterionName: string;
    description: string;
    maxPoints: number;
    weight: number;
  }>;
  failedTestCases: Array<{
    label: string;
    rationaleTag: string;
    verdict: string;
    actualStdout: string | null;
    diffLog: string | null;
  }>;
}

export class RagKnowledgeFacade {
  constructor(private readonly chromaVectorService = new ChromaVectorService()) {}

  async getGradingContext(submissionId: string, studentCode: string): Promise<RagContext> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            rubricRules: { orderBy: { orderIndex: 'asc' } },
            solutions: { where: { isActive: true }, take: 1 },
          },
        },
        testResults: { include: { testCase: true } },
      },
    });
    if (!submission) throw new RagUnavailableError('Không tìm thấy submission để dựng RAG context.');

    const assignment = submission.assignment;
    const solution = assignment.solutions[0];
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
      `Compiler error: ${submission.compileOutput ?? ''}`,
      `Failed tests: ${failedTestCases.map((test) =>
        `${test.label} ${test.rationaleTag} ${test.verdict} ${test.diffLog ?? test.actualStdout ?? ''}`
      ).join('\n')}`,
      `Student source excerpt: ${studentCode.slice(0, 4_096)}`,
    ].join('\n').slice(0, 8_192);

    let relevantSolutionChunks: RetrievedSolutionChunk[];
    try {
      relevantSolutionChunks = await this.chromaVectorService.queryRelevantChunks({
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
      referenceSolutionSource: solution.sourceCode,
      relevantSolutionChunks,
      rubricRules: assignment.rubricRules.map((rule) => ({
        id: rule.id,
        criterionName: rule.criterionName,
        description: rule.description,
        maxPoints: Number(rule.maxPoints),
        weight: Number(rule.weight),
      })),
      failedTestCases,
    };
  }
}
