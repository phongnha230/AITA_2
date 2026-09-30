import { Request, Response, NextFunction } from 'express';
import { StartTutorConversationUseCase } from '../../application/use-cases/start-tutor-conversation.use-case.js';
import { SendTutorMessageUseCase } from '../../application/use-cases/send-tutor-message.use-case.js';
import { GetTutorConversationUseCase } from '../../application/use-cases/get-tutor-conversation.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';

export class AiTutorController {
  constructor(
    private readonly startTutorConversationUseCase: StartTutorConversationUseCase,
    private readonly sendTutorMessageUseCase: SendTutorMessageUseCase,
    private readonly getTutorConversationUseCase: GetTutorConversationUseCase
  ) {}

  startConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) {
        throw new UnauthorizedError('Cần đăng nhập tài khoản sinh viên.');
      }

      const { submissionId, title } = req.body;
      const conversation = await this.startTutorConversationUseCase.execute(
        studentId,
        submissionId,
        title
      );
      sendSuccess(res, conversation, 'Khởi tạo phiên AI Tutor thành công.', 201);
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) {
        throw new UnauthorizedError('Cần đăng nhập tài khoản sinh viên.');
      }

      const { id: conversationId } = req.params;
      const { content } = req.body;

      const result = await this.sendTutorMessageUseCase.execute(
        conversationId,
        studentId,
        content
      );
      sendSuccess(res, result, 'Đã nhận phản hồi từ AI Tutor.', 200);
    } catch (error) {
      next(error);
    }
  };

  getConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) {
        throw new UnauthorizedError('Cần đăng nhập tài khoản sinh viên.');
      }

      const { id: conversationId } = req.params;
      const conversation = await this.getTutorConversationUseCase.execute(
        conversationId,
        studentId
      );
      sendSuccess(res, conversation, 'Lấy lịch sử hội thoại thành công.');
    } catch (error) {
      next(error);
    }
  };

  listMyConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user?.userId;
      if (!studentId) {
        throw new UnauthorizedError('Cần đăng nhập tài khoản sinh viên.');
      }

      const list = await this.getTutorConversationUseCase.listByStudent(studentId);
      sendSuccess(res, list, 'Lấy danh sách các phiên AI Tutor thành công.');
    } catch (error) {
      next(error);
    }
  };
}
