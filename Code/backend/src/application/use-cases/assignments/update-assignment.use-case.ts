import prisma from '../../../infrastructure/database/prisma.client.js';

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  allowedLanguages?: string;
  deadline?: string | Date;
  maxScore?: number;
  isTeamWork?: boolean;
}

export class UpdateAssignmentUseCase {
  async execute(assignmentId: string, input: UpdateAssignmentInput) {
    const existing = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existing) {
      throw new Error(`Không tìm thấy đề thi với ID: ${assignmentId}`);
    }

    let deadlineDate: Date | undefined;
    if (input.deadline) {
      deadlineDate = new Date(input.deadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('Định dạng hạn nộp (deadline) không hợp lệ');
      }
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title: input.title !== undefined ? input.title.trim() : undefined,
        description: input.description !== undefined ? input.description : undefined,
        allowedLanguages: input.allowedLanguages !== undefined ? input.allowedLanguages.toUpperCase().trim() : undefined,
        deadline: deadlineDate !== undefined ? deadlineDate : undefined,
        maxScore: input.maxScore !== undefined ? input.maxScore : undefined,
        isTeamWork: input.isTeamWork !== undefined ? input.isTeamWork : undefined,
      },
    });

    return updated;
  }
}

export const updateAssignmentUseCase = new UpdateAssignmentUseCase();
