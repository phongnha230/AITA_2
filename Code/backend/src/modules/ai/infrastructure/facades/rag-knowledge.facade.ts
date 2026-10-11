import prisma from '../../../../infrastructure/database/prisma.client.js';

export interface RagContext {
  assignmentTitle: string;
  assignmentDescription: string | null;
  environment: string;
  solutionSourceCode?: string;
  solutionExplanation?: string;
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
  /**
   * Truy xuất toàn bộ tri thức & ngữ cảnh cần thiết cho AI chấm điểm
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

    return {
      assignmentTitle: assignment.title,
      assignmentDescription: assignment.description,
      environment: assignment.environment,
      solutionSourceCode: solution?.sourceCode,
      solutionExplanation: solution?.explanation || undefined,
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

