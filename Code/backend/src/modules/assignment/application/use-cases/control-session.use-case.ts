import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';
import { ControlSessionDto } from '../dtos/assignment.dto.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

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

    if (action === 'EXTEND') {
      const now = Date.now();
      const currentDeadlineMs = new Date(existing.deadline).getTime();
      const baseMs = Math.max(now, currentDeadlineMs);
      const newDeadline = new Date(baseMs + extraMinutes * 60 * 1000);

      const updated = await this.assignmentRepository.update(assignmentId, {
        deadline: newDeadline,
        status: existing.status === 'CLOSED' ? 'PUBLISHED' : existing.status,
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

    if (action === 'CLOSE') {
      const now = new Date();
      const updated = await this.assignmentRepository.update(assignmentId, {
        status: 'CLOSED',
        deadline: now,
      });

      return {
        message: 'Đã đóng ca thi và kết thúc thu bài thi thành công!',
        action: 'CLOSE',
        status: updated.status,
        deadline: updated.deadline,
        secondsLeft: 0,
      };
    }

    if (action === 'START') {
      const now = new Date();
      const duration = existing.durationMinutes || 90;
      const newDeadline = new Date(now.getTime() + duration * 60 * 1000);

      const updated = await this.assignmentRepository.update(assignmentId, {
        status: 'PUBLISHED',
        startTime: now,
        deadline: newDeadline,
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
      const updated = await this.assignmentRepository.update(assignmentId, {
        status: 'DRAFT',
      });

      return {
        message: 'Đã tạm dừng ca thi.',
        action: 'PAUSE',
        status: updated.status,
      };
    }

    return {
      message: 'Thao tác hoàn tất.',
      action,
    };
  }
}
