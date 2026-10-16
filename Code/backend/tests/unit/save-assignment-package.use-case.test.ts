import { describe, expect, it, vi } from 'vitest';
import type { IAssignmentRepository } from '../../src/modules/assignment/domain/repositories/assignment.repository.interface.js';
import type { ICourseRepository } from '../../src/modules/course/domain/repositories/course.repository.interface.js';
import { Assignment } from '../../src/modules/assignment/domain/entities/assignment.entity.js';
import { Course } from '../../src/modules/course/domain/entities/course.entity.js';
import { SaveAssignmentPackageUseCase } from '../../src/modules/assignment/application/use-cases/save-assignment-package.use-case.js';
import type { SaveAssignmentPackageDto } from '../../src/modules/assignment/application/dtos/assignment.dto.js';

const assignment = new Assignment({
  id: 'assignment-1',
  courseId: 'course-1',
  title: 'PE exam',
  environment: 'C_GCC',
  submissionType: 'INDIVIDUAL',
  startTime: new Date('2026-10-15T00:00:00.000Z'),
  deadline: new Date('2026-10-16T00:00:00.000Z'),
  maxFileSizeBytes: 1_000_000n,
  allowGitSubmission: true,
  allowZipSubmission: true,
  status: 'PUBLISHED',
  createdBy: 'lecturer-1',
  createdAt: new Date('2026-10-14T00:00:00.000Z'),
  updatedAt: new Date('2026-10-14T00:00:00.000Z'),
});

const course = new Course({
  id: 'course-1',
  code: 'PRF192',
  name: 'Programming Fundamentals',
  semester: 'Fall 2026',
  lecturerId: 'lecturer-1',
  isActive: true,
  createdAt: new Date('2026-10-14T00:00:00.000Z'),
  updatedAt: new Date('2026-10-14T00:00:00.000Z'),
});

const payload = {
  assignment: {
    courseId: 'course-1',
    title: 'Updated PE exam',
    environment: 'C_GCC',
    submissionType: 'INDIVIDUAL',
    startTime: new Date('2026-10-15T00:00:00.000Z'),
    deadline: new Date('2026-10-16T00:00:00.000Z'),
    durationMinutes: 60,
    status: 'PUBLISHED',
    gradingVersion: 2,
    functionalMaxScore: 7,
    algorithmMaxScore: 2,
    cleanCodeMaxScore: 1,
  },
  testCases: [{ label: 'Visible case', points: 7 }],
  rubricRules: [
    { criterionName: 'Algorithm', description: 'Algorithm rubric', maxPoints: 2, weight: 1, orderIndex: 1, criterionType: 'ALGORITHM' },
    { criterionName: 'Clean code', description: 'Clean code rubric', maxPoints: 1, weight: 1, orderIndex: 2, criterionType: 'CLEAN_CODE' },
  ],
  removeSolution: false,
  removePdf: false,
  removeStarter: false,
} as unknown as SaveAssignmentPackageDto;

describe('SaveAssignmentPackageUseCase', () => {
  const makeUseCase = (submissionCount: number) => {
    const saveComplete = vi.fn().mockResolvedValue(assignment);
    const assignments = {
      findById: vi.fn().mockResolvedValue(assignment),
      countSubmissions: vi.fn().mockResolvedValue(submissionCount),
      saveComplete,
    } as unknown as IAssignmentRepository;
    const courses = { findById: vi.fn().mockResolvedValue(course) } as unknown as ICourseRepository;
    return { useCase: new SaveAssignmentPackageUseCase(assignments, courses), saveComplete };
  };

  it('rejects editing after a submission exists', async () => {
    const { useCase, saveComplete } = makeUseCase(1);

    await expect(useCase.execute(
      'assignment-1', payload, { userId: 'lecturer-1', role: 'LECTURER' }, true, {}
    )).rejects.toMatchObject({ statusCode: 409, errorCode: 'CONFLICT' });
    expect(saveComplete).not.toHaveBeenCalled();
  });

  it('rejects a lecturer who does not own the assignment course', async () => {
    const { useCase, saveComplete } = makeUseCase(0);

    await expect(useCase.execute(
      'assignment-1', payload, { userId: 'lecturer-2', role: 'LECTURER' }, true, {}
    )).rejects.toMatchObject({ statusCode: 403 });
    expect(saveComplete).not.toHaveBeenCalled();
  });

  it('keeps existing files when no replacement or removal is requested', async () => {
    const { useCase, saveComplete } = makeUseCase(0);

    await useCase.execute(
      'assignment-1', payload, { userId: 'lecturer-1', role: 'LECTURER' }, true, {}
    );

    expect(saveComplete).toHaveBeenCalledWith(
      'assignment-1', expect.objectContaining({ pdfFilePath: undefined, starterCodePath: undefined }),
      payload.testCases, payload.rubricRules, undefined, false
    );
  });

  it('rejects a package whose testcase and rubric scores do not match the assignment totals', async () => {
    const { useCase, saveComplete } = makeUseCase(0);
    const invalidPayload = {
      ...payload,
      testCases: [{ label: 'Visible case', points: 6 }],
    } as SaveAssignmentPackageDto;

    await expect(useCase.execute(
      'assignment-1', invalidPayload, { userId: 'lecturer-1', role: 'LECTURER' }, true, {}
    )).rejects.toMatchObject({ statusCode: 400 });
    expect(saveComplete).not.toHaveBeenCalled();
  });
});
