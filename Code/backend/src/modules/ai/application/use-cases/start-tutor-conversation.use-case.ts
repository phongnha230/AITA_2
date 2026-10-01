import prisma from '../../../../infrastructure/database/prisma.client.js';
import { IAiTutorRepository } from '../../domain/repositories/ai-tutor.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class StartTutorConversationUseCase {
  constructor(private readonly aiTutorRepository: IAiTutorRepository) {}

  public async execute(studentId: string, submissionId: string, title?: string) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { select: { title: true } },
      },
    });

    if (!submission) {
      throw new NotFoundError(`Bài nộp với ID: ${submissionId}`);
    }

    // Nếu là sinh viên thì chỉ được mở chat trên bài nộp của chính mình
    if (submission.userId !== studentId) {
      throw new ForbiddenError('Bạn chỉ có thể mở phiên AI Tutor trên bài nộp của chính mình.');
    }

    // Kiểm tra xem đã có phiên hội thoại chưa
    const existing = await this.aiTutorRepository.findConversationBySubmissionAndStudent(
      submissionId,
      studentId
    );

    if (existing) {
      return existing.toJSON();
    }

    const conversationTitle = title || `Hỗ trợ gỡ lỗi: ${submission.assignment.title}`;
    const newConversation = await this.aiTutorRepository.createConversation({
      submissionId,
      studentId,
      title: conversationTitle,
    });

    // Thêm lời chào mở đầu phong cách Socrates
    await this.aiTutorRepository.addMessage({
      conversationId: newConversation.id,
      senderRole: 'MODEL',
      content: `Xin chào bạn! Mình là AI Tutor của hệ thống AITA. Mình đã đọc bài nộp của bạn. Bạn đang thắc mắc hay cần mình cùng thảo luận về phần nào trong bài làm nhé?`,
    });

    const fullConversation = await this.aiTutorRepository.findConversationById(newConversation.id);
    return fullConversation!.toJSON();
  }
}
