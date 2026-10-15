import { IAiTutorRepository } from '../../domain/repositories/ai-tutor.repository.interface.js';
import { ISubmissionRepository } from '../../../submission/domain/repositories/submission.repository.interface.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export class StartTutorConversationUseCase {
  constructor(
    private readonly aiTutorRepository: IAiTutorRepository,
    private readonly submissionRepository: ISubmissionRepository
  ) {}

  public async execute(studentId: string, submissionId?: string, title?: string) {
    let targetSubmissionId = submissionId;

    if (!targetSubmissionId) {
      // Tự động tìm bài nộp gần nhất của sinh viên này
      const latest = await this.submissionRepository.findLatestByUser(studentId);
      if (latest) {
        targetSubmissionId = latest.id;
      }
    }

    if (!targetSubmissionId) {
      throw new ValidationError('Bạn chưa có bài nộp nào để AI Tutor hỗ trợ phân tích code.');
    }

    const submission = await this.submissionRepository.findById(targetSubmissionId);

    if (!submission) {
      throw new NotFoundError(`Bài nộp với ID: ${targetSubmissionId}`);
    }

    // Nếu là sinh viên thì chỉ được mở chat trên bài nộp của chính mình
    if (submission.userId !== studentId) {
      throw new ForbiddenError('Bạn chỉ có thể mở phiên AI Tutor trên bài nộp của chính mình.');
    }

    // Kiểm tra xem đã có phiên hội thoại chưa
    const existing = await this.aiTutorRepository.findConversationBySubmissionAndStudent(
      targetSubmissionId,
      studentId
    );

    if (existing) {
      return existing.toJSON();
    }

    const assignmentTitle = submission.assignment?.title || 'Bài tập';
    const conversationTitle = title || `Hỗ trợ gỡ lỗi: ${assignmentTitle}`;
    const newConversation = await this.aiTutorRepository.createConversation({
      submissionId: targetSubmissionId,
      studentId,
      title: conversationTitle,
    });

    // Thêm lời chào mở đầu phong cách Socrates
    await this.aiTutorRepository.addMessage({
      conversationId: newConversation.id,
      senderRole: 'MODEL',
      content: `Xin chào bạn! Mình là AI Tutor của hệ thống AITA. Mình đã đọc bài làm '${assignmentTitle}' của bạn. Bạn đang thắc mắc hay cần mình cùng thảo luận về phần nào trong bài làm nhé?`,
    });

    const fullConversation = await this.aiTutorRepository.findConversationById(newConversation.id);
    return fullConversation!.toJSON();
  }
}
