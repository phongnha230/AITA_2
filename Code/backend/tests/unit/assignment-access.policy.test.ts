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
});
