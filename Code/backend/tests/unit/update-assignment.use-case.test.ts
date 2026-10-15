import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IAssignmentRepository } from '../../src/modules/assignment/domain/repositories/assignment.repository.interface.js';
import { Assignment } from '../../src/modules/assignment/domain/entities/assignment.entity.js';
import { UpdateAssignmentUseCase } from '../../src/modules/assignment/application/use-cases/update-assignment.use-case.js';

const assignment = new Assignment({
  id: 'assignment-1',
  courseId: 'course-1',
  title: 'Algorithm exam',
  environment: 'JAVA_JDK',
  submissionType: 'INDIVIDUAL',
  startTime: new Date('2026-10-15T00:00:00.000Z'),
  deadline: new Date('2026-10-16T00:00:00.000Z'),
  maxFileSizeBytes: 1_000_000n,
  allowGitSubmission: true,
  allowZipSubmission: true,
  status: 'DRAFT',
  createdBy: 'lecturer-1',
  createdAt: new Date('2026-10-14T00:00:00.000Z'),
  updatedAt: new Date('2026-10-14T00:00:00.000Z'),
  gradingVersion: 2,
  functionalMaxScore: 7,
  algorithmMaxScore: 2,
  cleanCodeMaxScore: 1,
});

describe('UpdateAssignmentUseCase grading-v2 publishing gate', () => {
  let update: ReturnType<typeof vi.fn>;
  let useCase: UpdateAssignmentUseCase;

  beforeEach(() => {
    update = vi.fn().mockResolvedValue(assignment);
    const repository = {
      findById: vi.fn().mockResolvedValue(assignment),
      getTestCases: vi.fn().mockResolvedValue([{ points: 7 }]),
      getRubricRules: vi.fn().mockResolvedValue([
        { criterionType: 'ALGORITHM', maxPoints: 2 },
        { criterionType: 'CLEAN_CODE', maxPoints: 1 },
      ]),
      getSolutions: vi.fn().mockResolvedValue([{ isActive: true, expectedTimeComplexity: 'O(n log n)' }]),
      update,
    } as unknown as IAssignmentRepository;
    useCase = new UpdateAssignmentUseCase(repository);
  });

  it('rejects publishing when testcase weights do not total seven', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(assignment),
      getTestCases: vi.fn().mockResolvedValue([{ points: 8 }]),
      getRubricRules: vi.fn().mockResolvedValue([
        { criterionType: 'ALGORITHM', maxPoints: 2 },
        { criterionType: 'CLEAN_CODE', maxPoints: 1 },
      ]),
      getSolutions: vi.fn().mockResolvedValue([{ isActive: true, expectedTimeComplexity: 'O(n log n)' }]),
      update,
    } as unknown as IAssignmentRepository;
    useCase = new UpdateAssignmentUseCase(repository);

    await expect(useCase.execute('assignment-1', { status: 'PUBLISHED' })).rejects.toThrow(/test case/i);
    expect(update).not.toHaveBeenCalled();
  });

  it('publishes when functional tests and typed rubrics match 7+2+1', async () => {
    await expect(useCase.execute('assignment-1', { status: 'PUBLISHED' })).resolves.toBeDefined();
    expect(update).toHaveBeenCalledOnce();
  });
});
