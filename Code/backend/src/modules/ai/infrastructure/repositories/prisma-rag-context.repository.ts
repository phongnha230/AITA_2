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
        gradingSnapshot: true,
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            environment: true,
            course: { select: { code: true } },
            rubricRules: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                criterionName: true,
                description: true,
                maxPoints: true,
                weight: true,
                criterionType: true,
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
                expectedTimeComplexity: true,
                expectedSpaceComplexity: true,
                acceptedStrategies: true,
                algorithmNotes: true,
              },
            },
          },
        },
        testResults: {
          select: {
            verdict: true,
            testCaseId: true,
            executionTimeMs: true,
            memoryUsedKb: true,
            actualStdout: true,
            diffLog: true,
            testCase: { select: { label: true, rationaleTag: true } },
          },
        },
      },
    });
    if (!submission) return null;
    const snapshot = submission.gradingSnapshot as {
      assignment?: { id?: string; title?: string; description?: string | null; environment?: string; courseCode?: string };
      rubricRules?: Array<{ id: string; criterionName: string; description: string; maxPoints: number; weight: number; criterionType: 'GENERAL' | 'ALGORITHM' | 'CLEAN_CODE' }>;
      referenceSolution?: {
        id: string; title: string; contentHash: string; sourceCode: string; expectedTimeComplexity: string | null;
        expectedSpaceComplexity: string | null; acceptedStrategies: unknown; algorithmNotes: string | null;
      } | null;
      testCases?: Array<{ id: string; label: string; rationaleTag: string }>;
    } | null;
    const { solutions, rubricRules, course, ...assignment } = submission.assignment;
    const snapshotSolution = snapshot?.referenceSolution;
    const snapshotTestCases = new Map((snapshot?.testCases ?? []).map((testCase) => [testCase.id, testCase]));
    return {
      gradingSnapshot: submission.gradingSnapshot,
      compileOutput: submission.compileOutput,
      assignment: {
        ...assignment,
        id: snapshot?.assignment?.id ?? assignment.id,
        title: snapshot?.assignment?.title ?? assignment.title,
        description: snapshot?.assignment?.description ?? assignment.description,
        environment: snapshot?.assignment?.environment ?? assignment.environment,
        courseCode: snapshot?.assignment?.courseCode ?? course.code,
        rubricRules: snapshot?.rubricRules ?? rubricRules.map((rule) => ({
          ...rule,
          maxPoints: Number(rule.maxPoints),
          weight: Number(rule.weight),
          criterionType: rule.criterionType,
        })),
        activeSolution: snapshotSolution ? {
          id: snapshotSolution.id,
          assignmentId: assignment.id,
          activeKey: assignment.id,
          contentHash: snapshotSolution.contentHash,
          indexStatus: 'READY' as const,
          embeddingModel: null,
          chunkerVersion: null,
          sourceCode: snapshotSolution.sourceCode,
          expectedTimeComplexity: snapshotSolution.expectedTimeComplexity,
          expectedSpaceComplexity: snapshotSolution.expectedSpaceComplexity,
          acceptedStrategies: snapshotSolution.acceptedStrategies,
          algorithmNotes: snapshotSolution.algorithmNotes,
        } : solutions[0] ?? null,
      },
      testResults: submission.testResults.map((testResult) => ({
        ...testResult,
        testCase: snapshotTestCases.get(testResult.testCaseId) ?? testResult.testCase,
      })),
    };
  }
}
