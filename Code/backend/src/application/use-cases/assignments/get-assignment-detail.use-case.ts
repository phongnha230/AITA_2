import prisma from '../../../infrastructure/database/prisma.client.js';

export class GetAssignmentDetailUseCase {
  async execute(assignmentId: string, options?: { isStudent?: boolean }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true,
            lecturer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        rubricRules: {
          orderBy: { orderIndex: 'asc' },
        },
        testCases: {
          where: options?.isStudent ? { isHidden: false } : undefined,
          select: {
            id: true,
            questionNo: true,
            inputData: true,
            expectedOutput: options?.isStudent ? false : true,
            isHidden: true,
            timeLimitMs: true,
            memoryLimitMb: true,
            score: true,
            rationale: options?.isStudent ? false : true,
            testType: true,
            outputFileName: true,
          },
          orderBy: [{ questionNo: 'asc' }, { createdAt: 'asc' }],
        },
        _count: {
          select: {
            submissions: true,
            testCases: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new Error(`Không tìm thấy đề thi với ID: ${assignmentId}`);
    }

    return assignment;
  }

  async listByCourse(courseId: string) {
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: {
        _count: {
          select: {
            submissions: true,
            testCases: true,
            rubricRules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assignments;
  }
}

export const getAssignmentDetailUseCase = new GetAssignmentDetailUseCase();
