import { describe, expect, it, vi } from 'vitest';
import { PrismaSubmissionRepository } from '../../src/modules/submission/infrastructure/repositories/prisma-submission.repository.js';

const makePrisma = (run: Record<string, unknown>) => ({
  submission: { findUnique: vi.fn().mockResolvedValue({
    id: 'submission-1', userId: 'student-1', participants: [],
    assignment: { courseId: 'course-1', course: { lecturerId: 'lecturer-1' } },
  }) },
  gradingRun: { findMany: vi.fn().mockResolvedValue([run]) },
});

describe('PrismaSubmissionRepository grading history privacy', () => {
  it('redacts answer snapshots, hidden testcase payloads, and internal evidence paths for students', async () => {
    const run = {
      id: 'run-1', runNo: 1, status: 'PUBLISHED', createdAt: new Date(),
      snapshotJson: {
        assignment: { title: 'Exam' }, referenceSolution: { sourceCode: 'secret answer' },
        testCases: [{ id: 'hidden-1', isHidden: true }, { id: 'public-1', isHidden: false }],
      },
      stages: [{
        id: 'stage-1', stageKey: 'TESTCASES', status: 'COMPLETED',
        detailsJson: {
          testCases: [{ id: 'hidden-1', expectedStdout: 'secret testcase' }],
          results: [
            { testCaseId: 'hidden-1', expectedOutput: 'secret', inputData: 'private', verdict: 'FAILED' },
            { testCaseId: 'public-1', expectedOutput: 'visible', verdict: 'PASSED' },
          ],
        },
        evidence: [{ id: 'evidence-1', testCaseId: 'hidden-1', storagePath: 'C:/private.jpg' }],
      }],
    };
    const repository = new PrismaSubmissionRepository(makePrisma(run) as never);
    const history = await repository.getGradingHistory('submission-1', 'student-1', 'STUDENT') as Array<Record<string, unknown>>;
    const publishedRun = history[0] as { snapshotJson: Record<string, unknown>; stages: Array<Record<string, unknown>> };
    const stage = publishedRun.stages[0] as { detailsJson: Record<string, unknown>; evidence: Array<Record<string, unknown>> };
    expect(publishedRun.snapshotJson).not.toHaveProperty('referenceSolution');
    expect(stage.detailsJson).not.toHaveProperty('testCases');
    expect(stage.detailsJson.results).toEqual([
      { testCaseId: 'hidden-1', verdict: 'FAILED', isHidden: true },
      { testCaseId: 'public-1', expectedOutput: 'visible', verdict: 'PASSED' },
    ]);
    expect(stage.evidence).toEqual([]);
  });

  it('denies lecturers who do not own the course', async () => {
    const repository = new PrismaSubmissionRepository(makePrisma({ id: 'run-1', stages: [] }) as never);
    await expect(repository.getGradingHistory('submission-1', 'lecturer-2', 'LECTURER'))
      .rejects.toMatchObject({ statusCode: 403 });
  });
});
