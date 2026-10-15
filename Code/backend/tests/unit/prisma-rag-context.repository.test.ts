import { describe, expect, it, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { PrismaRagContextRepository } from '../../src/modules/ai/infrastructure/repositories/prisma-rag-context.repository.js';

describe('PrismaRagContextRepository', () => {
  it('loads the actual course code, reference grading notes, and sandbox performance metrics', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      compileOutput: null,
      assignment: {
        id: 'assignment-1',
        title: 'Sorting',
        description: 'Sort values efficiently',
        environment: 'JAVA_JDK',
        course: { code: 'CSD201' },
        rubricRules: [],
        solutions: [{
          id: 'solution-1',
          assignmentId: 'assignment-1',
          activeKey: 'assignment-1',
          contentHash: 'hash',
          indexStatus: 'READY',
          embeddingModel: 'embedding',
          chunkerVersion: 'v1',
          sourceCode: 'reference',
          expectedTimeComplexity: 'O(n log n)',
          expectedSpaceComplexity: 'O(n)',
          acceptedStrategies: ['merge sort'],
          algorithmNotes: 'Accept equivalent sorting strategies.',
        }],
      },
      testResults: [{
        verdict: 'PASSED',
        executionTimeMs: 24,
        memoryUsedKb: 4096,
        actualStdout: '1 2 3',
        diffLog: null,
        testCase: { label: 'large-array', rationaleTag: 'PERFORMANCE' },
      }],
    });
    const repository = new PrismaRagContextRepository({
      submission: { findUnique },
    } as unknown as PrismaClient);

    const context = await repository.findSubmissionContext('submission-1');

    expect(context?.assignment.courseCode).toBe('CSD201');
    expect(context?.assignment.activeSolution?.algorithmNotes).toContain('equivalent');
    expect(context?.testResults[0]).toMatchObject({ executionTimeMs: 24, memoryUsedKb: 4096 });
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'submission-1' } }));
  });
});
