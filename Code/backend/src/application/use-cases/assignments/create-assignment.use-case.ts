import prisma from '../../../infrastructure/database/prisma.client.js';

export interface CreateAssignmentInput {
  courseId: string;
  title: string;
  description: string;
  allowedLanguages?: string; // Ví dụ: 'C,JAVA' hoặc 'C' hoặc 'JAVA'
  deadline: string | Date;
  maxScore?: number;
  isTeamWork?: boolean;
}

export class CreateAssignmentUseCase {
  async execute(input: CreateAssignmentInput) {
    if (!input.courseId || !input.title || !input.description || !input.deadline) {
      throw new Error('Các trường courseId, title, description và deadline là bắt buộc');
    }

    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new Error(`Không tìm thấy khóa học với ID: ${input.courseId}`);
    }

    const deadlineDate = new Date(input.deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error('Định dạng hạn nộp (deadline) không hợp lệ');
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: input.courseId,
        title: input.title.trim(),
        description: input.description,
        allowedLanguages: input.allowedLanguages ? input.allowedLanguages.toUpperCase().trim() : 'C,JAVA',
        deadline: deadlineDate,
        maxScore: input.maxScore !== undefined ? input.maxScore : 10.0,
        isTeamWork: input.isTeamWork !== undefined ? input.isTeamWork : false,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true,
          },
        },
      },
    });

    return assignment;
  }
}

export const createAssignmentUseCase = new CreateAssignmentUseCase();
