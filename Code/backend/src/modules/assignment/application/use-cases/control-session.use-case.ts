import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { ControlSessionDto } from '../dtos/assignment.dto.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class ControlSessionUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(
    assignmentId: string,
    dto: ControlSessionDto,
    _requester?: { userId: string; role: string }
  ) {
    const existing = await this.assignmentRepository.findById(assignmentId);
    if (!existing) {
      throw new NotFoundError(`Đề thi với ID: ${assignmentId}`);
    }

    const { action, extraMinutes = 5 } = dto;
    const now = new Date();

    if (action === 'EXTEND') {
      if (existing.status === 'ARCHIVED') {
        throw new ConflictError('Ca thi đã lưu trữ, không thể gia hạn.');
      }
      // Điểm mốc gia hạn: nếu deadline đã quá hạn so với hiện tại, tính từ thời điểm hiện tại (now)
      const baseTimeMs = Math.max(now.getTime(), existing.deadline ? existing.deadline.getTime() : now.getTime());
      const newDeadline = new Date(baseTimeMs + extraMinutes * 60 * 1000);

      // Nếu ca thi đang ở trạng thái CLOSED hoặc PAUSED, mở lại PUBLISHED để sinh viên có thể tiếp tục nộp bài
      const updatedStatus = existing.status === 'CLOSED' || existing.status === 'PAUSED' ? 'PUBLISHED' : existing.status;

      const updated = await this.assignmentRepository.update(assignmentId, {
        deadline: newDeadline,
        status: updatedStatus,
        pausedAt: null,
      });

      const secondsLeft = Math.max(0, Math.round((newDeadline.getTime() - Date.now()) / 1000));

      return {
        message: `Đã gia hạn thêm +${extraMinutes} phút cho ca thi!`,
        action: 'EXTEND',
        deadline: updated.deadline,
        status: updated.status,
        secondsLeft,
      };
    }

    if (action === 'REOPEN') {
      const duration = extraMinutes && extraMinutes > 0 ? extraMinutes : (existing.durationMinutes || 90);
      const newDeadline = new Date(now.getTime() + duration * 60 * 1000);

      const updatePayload: Record<string, unknown> = {
        status: 'PUBLISHED',
        startTime: now,
        deadline: newDeadline,
        durationMinutes: duration,
        pausedAt: null,
      };

      if (dto.newAccessCode && dto.newAccessCode.trim()) {
        updatePayload.accessCode = dto.newAccessCode.trim().toUpperCase();
      }

      const updated = await this.assignmentRepository.update(assignmentId, updatePayload as any);

      // Xóa các bản ghi auto-zero do hết hạn ca trước đó để SV có thể thi và nộp lại
      const clearedCount = await this.assignmentRepository.clearAutoZeroSubmissions(assignmentId);

      const secondsLeft = Math.max(0, Math.round((newDeadline.getTime() - Date.now()) / 1000));

      return {
        message: `Đã mở lại ca thi thành công! Thời gian làm bài mới: ${duration} phút${clearedCount > 0 ? ` (Đã mở lại quyền nộp cho ${clearedCount} SV chưa nộp)` : ''}.`,
        action: 'REOPEN',
        status: updated.status,
        deadline: updated.deadline,
        secondsLeft,
      };
    }

    if (action === 'CLOSE') {
      const updated = await this.assignmentRepository.update(assignmentId, {
        status: 'CLOSED',
        deadline: now,
      });

      const autoZeroCount = await this.assignmentRepository.finalizeUnsubmittedStudents(assignmentId);

      return {
        message:
          autoZeroCount > 0
            ? `Đã đóng ca thi! Đã tự động chốt 0 điểm cho ${autoZeroCount} sinh viên không nộp bài.`
            : 'Đã đóng ca thi và kết thúc thu bài thi thành công!',
        action: 'CLOSE',
        status: updated.status,
        deadline: updated.deadline,
        secondsLeft: 0,
        autoZeroCount,
      };
    }

    
    if (action === 'PUBLISH_GRADES') {
      const stats = await this.assignmentRepository.publishAllGrades(assignmentId);
      return {
        message: `Đã công bố điểm chính thức cho ${stats.publishedCount} bài thi! Điểm trung bình: ${stats.averageScore.toFixed(1)}/10.`,
        action: 'PUBLISH_GRADES',
        status: existing.status,
        publishedCount: stats.publishedCount,
        averageScore: stats.averageScore,
      };
    }

    if (action === 'START') {
      if (existing.status !== 'PUBLISHED' || now >= existing.startTime) {
        throw new ConflictError('Chỉ có thể bắt đầu sớm một ca thi đã công bố và chưa bắt đầu.');
      }
      const duration = existing.durationMinutes || 90;
      const newDeadline = new Date(now.getTime() + duration * 60 * 1000);

      const updated = await this.assignmentRepository.update(assignmentId, {
        status: 'PUBLISHED',
        startTime: now,
        deadline: newDeadline,
        pausedAt: null,
      });

      const secondsLeft = Math.max(0, Math.round((newDeadline.getTime() - Date.now()) / 1000));

      return {
        message: 'Đã bắt đầu ca thi thành công!',
        action: 'START',
        status: updated.status,
        startTime: updated.startTime,
        deadline: updated.deadline,
        secondsLeft,
      };
    }

    if (action === 'PAUSE') {
      if (existing.status !== 'PUBLISHED' || now < existing.startTime || now >= existing.deadline) {
        throw new ConflictError('Chỉ có thể tạm dừng ca thi đang mở.');
      }
      const updated = await this.assignmentRepository.update(assignmentId, {
        status: 'PAUSED',
        pausedAt: now,
      });

      return {
        message: 'Đã tạm dừng ca thi.',
        action: 'PAUSE',
        status: updated.status,
        pausedAt: updated.pausedAt,
        deadline: updated.deadline,
        secondsLeft: Math.max(0, Math.round((updated.deadline.getTime() - now.getTime()) / 1000)),
      };
    }

    if (action === 'RESUME') {
      if (existing.status !== 'PAUSED' || !existing.pausedAt) {
        throw new ConflictError('Ca thi hiện không ở trạng thái tạm dừng.');
      }
      const pauseDuration = Math.max(0, now.getTime() - existing.pausedAt.getTime());
      const updated = await this.assignmentRepository.update(assignmentId, {
        status: 'PUBLISHED',
        deadline: new Date(existing.deadline.getTime() + pauseDuration),
        pausedAt: null,
      });
      return {
        message: 'Đã tiếp tục ca thi, thời gian tạm dừng được cộng bù vào hạn nộp.',
        action: 'RESUME',
        status: updated.status,
        deadline: updated.deadline,
        secondsLeft: Math.max(0, Math.round((updated.deadline.getTime() - now.getTime()) / 1000)),
      };
    }

    throw new ForbiddenError('Thao tác điều khiển ca thi không được hỗ trợ.');
  }
}
