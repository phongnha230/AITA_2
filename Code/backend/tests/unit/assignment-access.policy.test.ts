import { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { PrismaAssignmentAccessPolicy } from '../../src/modules/assignment/infrastructure/policies/prisma-assignment-access.policy.js';
import { ForbiddenError } from '../../src/shared/domain/exceptions/app.error.js';

interface FakePrisma {
  assignment: { findUnique: ReturnType<typeof vi.fn> };
  course: { findUnique: ReturnType<typeof vi.fn> };
  testCase: { findUnique: ReturnType<typeof vi.fn> };
  submission: { findUnique: ReturnType<typeof vi.fn> };
}

const makePolicy = (overrides: Partial<FakePrisma> = {}) => {
  const fake: FakePrisma = {
    assignment: { findUnique: vi.fn() },
    course: { findUnique: vi.fn() },
    testCase: { findUnique: vi.fn() },
    submission: { findUnique: vi.fn() },
    ...overrides,
  };
  return { policy: new PrismaAssignmentAccessPolicy(fake as unknown as PrismaClient), fake };
};

describe('PrismaAssignmentAccessPolicy', () => {
  it('allows only the owning lecturer to manage an assignment', async () => {
    const { policy } = makePolicy({
      assignment: { findUnique: vi.fn(async () => ({ course: { lecturerId: 'lecturer-1' } })) },
    });

    await expect(
      policy.assertCanManageAssignment({ userId: 'lecturer-1', role: 'LECTURER' }, 'assignment-1')
    ).resolves.toBeUndefined();
    await expect(
      policy.assertCanManageAssignment({ userId: 'lecturer-2', role: 'LECTURER' }, 'assignment-1')
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows an enrolled student to view an assignment and rejects another student', async () => {
    const { policy, fake } = makePolicy();
    fake.assignment.findUnique.mockImplementation(async (args: { select: unknown }) => ({
      course: {
        lecturerId: 'lecturer-1',
        enrollments: JSON.stringify(args).includes('student-1') ? [{ id: 'enrollment-1' }] : [],
      },
    }));

    await expect(
      policy.assertCanViewAssignment({ userId: 'student-1', role: 'STUDENT' }, 'assignment-1')
    ).resolves.toBeUndefined();
    await expect(
      policy.assertCanViewAssignment({ userId: 'student-2', role: 'STUDENT' }, 'assignment-1')
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('requires an enrolled student to unlock the exam before accessing content', async () => {
    const { policy, fake } = makePolicy();
    fake.assignment.findUnique.mockResolvedValue({
      status: 'PUBLISHED',
      startTime: new Date(Date.now() - 60_000),
      deadline: new Date(Date.now() + 60_000),
      course: { enrollments: [{ id: 'enrollment-1' }] },
      examAccessGrants: [{ id: 'grant-1' }],
    });

    await expect(policy.assertCanAccessExamContent({ userId: 'student-1', role: 'STUDENT' }, 'assignment-1'))
      .resolves.toBeUndefined();
    fake.assignment.findUnique.mockResolvedValueOnce({
      status: 'PUBLISHED',
      startTime: new Date(Date.now() - 60_000),
      deadline: new Date(Date.now() + 60_000),
      course: { enrollments: [{ id: 'enrollment-1' }] },
      examAccessGrants: [],
    });
    await expect(policy.assertCanAccessExamContent({ userId: 'student-1', role: 'STUDENT' }, 'assignment-1'))
      .rejects.toBeInstanceOf(ForbiddenError);
  });

  it('blocks exam content while the session is paused and allows granted students to check their waiting state', async () => {
    const { policy, fake } = makePolicy();
    fake.assignment.findUnique.mockResolvedValue({
      status: 'PAUSED',
      startTime: new Date(Date.now() - 60_000),
      deadline: new Date(Date.now() + 60_000),
      course: { enrollments: [{ id: 'enrollment-1' }] },
      examAccessGrants: [{ id: 'grant-1' }],
    });
    await expect(policy.assertCanAccessExamContent({ userId: 'student-1', role: 'STUDENT' }, 'assignment-1'))
      .rejects.toThrow(/tạm dừng/i);
    await expect(policy.assertCanViewUnlockedExam({ userId: 'student-1', role: 'STUDENT' }, 'assignment-1'))
      .resolves.toBeUndefined();
  });

  it('allows a student to access their own or team submission only', async () => {
    const { policy, fake } = makePolicy();
    fake.submission.findUnique.mockImplementation(async (args: { select: unknown }) => {
      const serialized = JSON.stringify(args);
      const actorIsTeamMember = serialized.includes('student-team');
      return {
        userId: 'student-owner',
        assignment: { course: { lecturerId: 'lecturer-1' } },
        team: { members: actorIsTeamMember ? [{ id: 'member-1' }] : [] },
      };
    });

    await expect(
      policy.assertCanAccessSubmission({ userId: 'student-owner', role: 'STUDENT' }, 'submission-1')
    ).resolves.toBeUndefined();
    await expect(
      policy.assertCanAccessSubmission({ userId: 'student-team', role: 'STUDENT' }, 'submission-1')
    ).resolves.toBeUndefined();
    await expect(
      policy.assertCanAccessSubmission({ userId: 'student-other', role: 'STUDENT' }, 'submission-1')
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows ADMIN to access any existing assignment or submission', async () => {
    const { policy } = makePolicy({
      assignment: { findUnique: vi.fn(async () => ({ course: { lecturerId: 'lecturer-1' } })) },
      submission: {
        findUnique: vi.fn(async () => ({
          userId: 'student-1',
          assignment: { course: { lecturerId: 'lecturer-1' } },
          team: null,
        })),
      },
    });

    await expect(
      policy.assertCanManageAssignment({ userId: 'admin-1', role: 'ADMIN' }, 'assignment-1')
    ).resolves.toBeUndefined();
    await expect(
      policy.assertCanAccessSubmission({ userId: 'admin-1', role: 'ADMIN' }, 'submission-1')
    ).resolves.toBeUndefined();
  });

  it('enforces lecturer ownership for assignment view and submission access', async () => {
    const { policy } = makePolicy({
      assignment: { findUnique: vi.fn(async () => ({ course: { lecturerId: 'lecturer-1', enrollments: [] } })) },
      submission: { findUnique: vi.fn(async () => ({
        userId: 'student-1',
        assignment: { course: { lecturerId: 'lecturer-1' } },
        team: null,
      })) },
    });
    await expect(policy.assertCanViewAssignment(
      { userId: 'lecturer-1', role: 'LECTURER' }, 'assignment-1'
    )).resolves.toBeUndefined();
    await expect(policy.assertCanViewAssignment(
      { userId: 'lecturer-2', role: 'LECTURER' }, 'assignment-1'
    )).rejects.toBeInstanceOf(ForbiddenError);
    await expect(policy.assertCanAccessSubmission(
      { userId: 'lecturer-1', role: 'LECTURER' }, 'submission-1'
    )).resolves.toBeUndefined();
    await expect(policy.assertCanAccessSubmission(
      { userId: 'lecturer-2', role: 'LECTURER' }, 'submission-1'
    )).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('enforces course access for admin, owner, enrolled student and outsiders', async () => {
    const { policy, fake } = makePolicy();
    fake.course.findUnique.mockImplementation(async (args: { select: unknown }) => ({
      lecturerId: 'lecturer-1',
      enrollments: JSON.stringify(args).includes('student-1') ? [{ id: 'enrollment-1' }] : [],
    }));
    await expect(policy.assertCanViewCourse({ userId: 'admin', role: 'ADMIN' }, 'course-1'))
      .resolves.toBeUndefined();
    await expect(policy.assertCanViewCourse({ userId: 'lecturer-1', role: 'LECTURER' }, 'course-1'))
      .resolves.toBeUndefined();
    await expect(policy.assertCanViewCourse({ userId: 'student-1', role: 'STUDENT' }, 'course-1'))
      .resolves.toBeUndefined();
    await expect(policy.assertCanViewCourse({ userId: 'student-2', role: 'STUDENT' }, 'course-1'))
      .rejects.toBeInstanceOf(ForbiddenError);
  });

  it('delegates test-case management to assignment ownership', async () => {
    const { policy } = makePolicy({
      testCase: { findUnique: vi.fn(async () => ({ assignmentId: 'assignment-1' })) },
      assignment: { findUnique: vi.fn(async () => ({ course: { lecturerId: 'lecturer-1' } })) },
    });
    await expect(policy.assertCanManageTestCase(
      { userId: 'lecturer-1', role: 'LECTURER' }, 'test-1'
    )).resolves.toBeUndefined();
    await expect(policy.assertCanManageTestCase(
      { userId: 'student-1', role: 'STUDENT' }, 'test-1'
    )).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('returns not found for missing protected resources', async () => {
    const { policy } = makePolicy({
      assignment: { findUnique: vi.fn(async () => null) },
      course: { findUnique: vi.fn(async () => null) },
      testCase: { findUnique: vi.fn(async () => null) },
      submission: { findUnique: vi.fn(async () => null) },
    });
    await expect(policy.assertCanViewAssignment({ userId: 'u', role: 'ADMIN' }, 'missing')).rejects.toThrow();
    await expect(policy.assertCanManageAssignment({ userId: 'u', role: 'ADMIN' }, 'missing')).rejects.toThrow();
    await expect(policy.assertCanViewCourse({ userId: 'u', role: 'ADMIN' }, 'missing')).rejects.toThrow();
    await expect(policy.assertCanManageTestCase({ userId: 'u', role: 'ADMIN' }, 'missing')).rejects.toThrow();
    await expect(policy.assertCanAccessSubmission({ userId: 'u', role: 'ADMIN' }, 'missing')).rejects.toThrow();
  });
});
