import { PrismaClient } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export interface AccessActor {
  userId: string;
  role: string;
}

export class PrismaAssignmentAccessPolicy {
  constructor(private readonly prisma: PrismaClient) {}

  async assertCanViewAssignment(actor: AccessActor, assignmentId: string): Promise<void> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        course: {
          select: {
            lecturerId: true,
            enrollments: { where: { studentId: actor.userId }, select: { id: true }, take: 1 },
          },
        },
      },
    });
    if (!assignment) throw new NotFoundError('Đề thi');
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'LECTURER' && assignment.course.lecturerId === actor.userId) return;
    if (actor.role === 'STUDENT' && assignment.course.enrollments.length > 0) return;
    throw new ForbiddenError('Bạn không có quyền truy cập đề thi này.');
  }

  async assertCanManageAssignment(actor: AccessActor, assignmentId: string): Promise<void> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { course: { select: { lecturerId: true } } },
    });
    if (!assignment) throw new NotFoundError('Đề thi');
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'LECTURER' && assignment.course.lecturerId === actor.userId) return;
    throw new ForbiddenError('Bạn không có quyền quản lý đề thi này.');
  }

  async assertCanViewCourse(actor: AccessActor, courseId: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        lecturerId: true,
        enrollments: { where: { studentId: actor.userId }, select: { id: true }, take: 1 },
      },
    });
    if (!course) throw new NotFoundError('Khóa học');
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'LECTURER' && course.lecturerId === actor.userId) return;
    if (actor.role === 'STUDENT' && course.enrollments.length > 0) return;
    throw new ForbiddenError('Bạn không có quyền truy cập khóa học này.');
  }

  async assertCanManageTestCase(actor: AccessActor, testCaseId: string): Promise<void> {
    const testCase = await this.prisma.testCase.findUnique({
      where: { id: testCaseId },
      select: { assignmentId: true },
    });
    if (!testCase) throw new NotFoundError('Test case');
    await this.assertCanManageAssignment(actor, testCase.assignmentId);
  }

  async assertCanAccessSubmission(actor: AccessActor, submissionId: string): Promise<void> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        userId: true,
        assignment: { select: { course: { select: { lecturerId: true } } } },
        team: {
          select: { members: { where: { userId: actor.userId }, select: { id: true }, take: 1 } },
        },
      },
    });
    if (!submission) throw new NotFoundError('Bài nộp');
    if (actor.role === 'ADMIN') return;
    if (actor.role === 'LECTURER' && submission.assignment.course.lecturerId === actor.userId) return;
    if (
      actor.role === 'STUDENT' &&
      (submission.userId === actor.userId || (submission.team?.members.length ?? 0) > 0)
    ) return;
    throw new ForbiddenError('Bạn không có quyền truy cập bài nộp này.');
  }
}
