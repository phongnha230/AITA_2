import { PrismaClient } from '@prisma/client';
import {
  IRagContextRepository,
  RagSubmissionData,
} from '../../domain/repositories/rag-context.repository.interface.js';

export class PrismaRagContextRepository implements IRagContextRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findSubmissionContext(submissionId: string): Promise<RagSubmissionData | null> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        compileOutput: true,
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            environment: true,
            rubricRules: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                criterionName: true,
                description: true,
                maxPoints: true,
                weight: true,
              },
            },
            solutions: {
              where: { isActive: true },
              take: 1,
              select: {
                id: true,
                assignmentId: true,
                activeKey: true,
                contentHash: true,
                indexStatus: true,
                embeddingModel: true,
                chunkerVersion: true,
                sourceCode: true,
              },
            },
          },
        },
        testResults: {
          select: {
            verdict: true,
            actualStdout: true,
            diffLog: true,
            testCase: { select: { label: true, rationaleTag: true } },
          },
        },
      },
    });
    if (!submission) return null;
    const { solutions, rubricRules, ...assignment } = submission.assignment;
    return {
      compileOutput: submission.compileOutput,
      assignment: {
        ...assignment,
        rubricRules: rubricRules.map((rule) => ({
          ...rule,
          maxPoints: Number(rule.maxPoints),
          weight: Number(rule.weight),
        })),
        activeSolution: solutions[0] ?? null,
      },
      testResults: submission.testResults,
    };
  }
}
