import { describe, expect, it, vi } from 'vitest';
import type { IAssignmentRepository } from '../../src/modules/assignment/domain/repositories/assignment.repository.interface.js';
import { ExamSessionUseCase } from '../../src/modules/assignment/application/use-cases/exam-session.use-case.js';

const status = { assignmentId: 'assignment-1', status: 'UPCOMING' as const, assignmentStatus: 'PUBLISHED' as const,
  startTime: new Date('2026-10-17T10:00:00.000Z'), deadline: new Date('2026-10-17T11:00:00.000Z'), durationMinutes: 60, pausedAt: null };

describe('ExamSessionUseCase', () => {
  it('opens the exam for an enrolled student with a matching code and exposes the waiting schedule', async () => {
    const unlockExam = vi.fn().mockResolvedValue(status);
    const useCase = new ExamSessionUseCase({ unlockExam } as unknown as IAssignmentRepository);
    await expect(useCase.unlock('assignment-1', 'student-1', 'STUDENT', 'PE-2026')).resolves.toEqual(status);
    expect(unlockExam).toHaveBeenCalledWith('assignment-1', 'student-1', 'PE-2026');
  });

  it('does not allow lecturer or admin roles to create student unlock grants', async () => {
    const unlockExam = vi.fn();
    const useCase = new ExamSessionUseCase({ unlockExam } as unknown as IAssignmentRepository);
    await expect(useCase.unlock('assignment-1', 'lecturer-1', 'LECTURER', 'PE-2026')).rejects.toThrow(/sinh viên/i);
    expect(unlockExam).not.toHaveBeenCalled();
  });
});
