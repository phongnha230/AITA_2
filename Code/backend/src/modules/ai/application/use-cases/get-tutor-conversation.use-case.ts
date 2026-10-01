import { IAiTutorRepository } from '../../domain/repositories/ai-tutor.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export class GetTutorConversationUseCase {
  constructor(private readonly aiTutorRepository: IAiTutorRepository) {}

  public async execute(conversationId: string, studentId: string) {
    const conversation = await this.aiTutorRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundError(`Cuộc trò chuyện với ID: ${conversationId}`);
    }

    if (conversation.studentId !== studentId) {
      throw new ForbiddenError('Bạn không có quyền truy cập cuộc trò chuyện này.');
    }

    return conversation.toJSON();
  }

  public async listByStudent(studentId: string) {
    const conversations = await this.aiTutorRepository.findConversationsByStudent(studentId);
    return conversations.map((c) => c.toJSON());
  }
}
