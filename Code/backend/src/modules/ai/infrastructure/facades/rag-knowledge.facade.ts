import prisma from '../../../../infrastructure/database/prisma.client.js';
import { CodeChunker } from '../chunking/code-chunker.js';
import { ChromaVectorService } from '../vector/chroma-vector.service.js';

export interface RagContext {
  assignmentTitle: string;
  assignmentDescription: string | null;
  environment: string;
  solutionSourceCode?: string;
  solutionExplanation?: string;
  relevantSolutionChunks?: Array<{
    name: string;
    code: string;
  }>;
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
  private chromaVectorService: ChromaVectorService;

  constructor() {
    this.chromaVectorService = new ChromaVectorService();
  }

  /**
   * Đánh chỉ mục bài giải mẫu của giảng viên vào ChromaDB theo từng chunk
   */
  async indexAssignmentSolution(assignmentId: string): Promise<void> {
    const solution = await prisma.assignmentSolution.findFirst({
      where: { assignmentId, isActive: true },
      include: { assignment: true },
    });

    if (!solution || !solution.sourceCode) return;

    const env = solution.assignment.environment;
    const chunks = CodeChunker.chunkSourceCode(solution.sourceCode, env);

    await this.chromaVectorService.indexSolutionChunks(assignmentId, chunks, env);
  }

  /**
   * Truy xuất toàn bộ tri thức & ngữ cảnh cần thiết cho AI chấm điểm
   * Sử dụng RAG Semantic Retrieval từ ChromaDB đối với các testcase bị trượt
   */
  async getGradingContext(submissionId: string): Promise<RagContext | null> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            rubricRules: { orderBy: { orderIndex: 'asc' } },
            solutions: {
              where: { isActive: true },
              take: 1,
            },
          },
        },
        testResults: {
          include: {
            testCase: true,
          },
        },
      },
    });

    if (!submission) return null;

    const assignment = submission.assignment;
    const solution = assignment.solutions[0];

    // Lọc danh sách testcase bị lỗi từ Sandbox (TV5)
    const failedTestCases = submission.testResults
      .filter((tr: any) => tr.verdict !== 'PASSED')
      .map((tr: any) => ({
        label: tr.testCase.label,
        rationaleTag: tr.testCase.rationaleTag,
        verdict: tr.verdict,
        actualStdout: tr.actualStdout,
        diffLog: tr.diffLog,
      }));

    // --- RAG RETRIEVAL: Tìm các hàm bài giải mẫu từ ChromaDB tương ứng với lỗi ---
    let relevantSolutionChunks: Array<{ name: string; code: string }> = [];

    if (solution?.sourceCode) {
      if (failedTestCases.length > 0) {
        // Tạo query truy vấn dựa trên lỗi thực tế
        const queryDescription = failedTestCases
          .map((tc) => `${tc.label} ${tc.rationaleTag} ${tc.diffLog || ''}`)
          .join(' ');

        relevantSolutionChunks = await this.chromaVectorService.queryRelevantChunks(
          assignment.id,
          queryDescription,
          3 // Lấy 3 hàm liên quan nhất
        );
      }

      // Nếu ChromaDB chưa có index hoặc trả về rỗng, tự động chunking và lưu vào ChromaDB
      if (relevantSolutionChunks.length === 0) {
        const chunks = CodeChunker.chunkSourceCode(solution.sourceCode, assignment.environment);
        
        // Background indexing
        this.chromaVectorService.indexSolutionChunks(assignment.id, chunks, assignment.environment).catch(() => {});

        // Fallback: Lấy các chunk hàm đầu tiên hoặc toàn bộ mã nguồn
        relevantSolutionChunks = chunks.slice(0, 3).map((c) => ({
          name: c.name,
          code: c.code,
        }));
      }
    }

    return {
      assignmentTitle: assignment.title,
      assignmentDescription: assignment.description,
      environment: assignment.environment,
      solutionSourceCode: solution?.sourceCode,
      solutionExplanation: solution?.explanation || undefined,
      relevantSolutionChunks,
      rubricRules: assignment.rubricRules.map((r: any) => ({
        id: r.id,
        criterionName: r.criterionName,
        description: r.description,
        maxPoints: Number(r.maxPoints),
        weight: Number(r.weight),
      })),
      failedTestCases,
    };
  }
}
