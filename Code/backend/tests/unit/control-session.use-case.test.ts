import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IAssignmentRepository } from '../../src/modules/assignment/domain/repositories/assignment.repository.interface.js';
import { Assignment } from '../../src/modules/assignment/domain/entities/assignment.entity.js';
import { ControlSessionUseCase } from '../../src/modules/assignment/application/use-cases/control-session.use-case.js';

const fixedNow = new Date('2026-10-16T10:00:00.000Z');
const makeAssignment = (overrides: Partial<ConstructorParameters<typeof Assignment>[0]> = {}) => new Assignment({
  id: 'assignment-1', courseId: 'course-1', title: 'PE', environment: 'C_GCC', submissionType: 'INDIVIDUAL',
  startTime: new Date('2026-10-16T10:05:00.000Z'), deadline: new Date('2026-10-16T11:05:00.000Z'),
  durationMinutes: 65, accessCode: 'PE-2026', maxFileSizeBytes: 50_000_000n,
  allowGitSubmission: true, allowZipSubmission: true, status: 'PUBLISHED', createdBy: 'lecturer-1',
  createdAt: fixedNow, updatedAt: fixedNow, ...overrides,
});

describe('ControlSessionUseCase', () => {
  afterEach(() => vi.useRealTimers());

  it('starts a published upcoming session now and resets its deadline to the configured duration', async () => {
    vi.useFakeTimers(); vi.setSystemTime(fixedNow);
    const update = vi.fn(async (_id: string, changes: Record<string, unknown>) => makeAssignment({ ...changes } as Partial<ConstructorParameters<typeof Assignment>[0]>));
    const repository = { findById: vi.fn().mockResolvedValue(makeAssignment()), update } as unknown as IAssignmentRepository;
    const result = await new ControlSessionUseCase(repository).execute('assignment-1', { action: 'START' });
    expect(update).toHaveBeenCalledWith('assignment-1', expect.objectContaining({ status: 'PUBLISHED', startTime: fixedNow, deadline: new Date('2026-10-16T11:05:00.000Z') }));
    expect(result.secondsLeft).toBe(3900);
  });

  it('freezes and restores remaining time after a pause', async () => {
    vi.useFakeTimers(); vi.setSystemTime(fixedNow);
    let current = makeAssignment({ startTime: new Date('2026-10-16T09:00:00.000Z'), deadline: new Date('2026-10-16T10:30:00.000Z') });
    const repository = {
      findById: vi.fn(async () => current),
      update: vi.fn(async (_id: string, changes: Record<string, unknown>) => {
        current = makeAssignment({ ...current.toJSON(), ...changes } as Partial<ConstructorParameters<typeof Assignment>[0]>);
        return current;
      }),
    } as unknown as IAssignmentRepository;
    const useCase = new ControlSessionUseCase(repository);
    await useCase.execute('assignment-1', { action: 'PAUSE' });
    expect(current.status).toBe('PAUSED');
    vi.advanceTimersByTime(120_000);
    const resumed = await useCase.execute('assignment-1', { action: 'RESUME' });
    expect(current.status).toBe('PUBLISHED');
    expect(current.deadline).toEqual(new Date('2026-10-16T10:32:00.000Z'));
    expect(resumed.secondsLeft).toBe(1800);
  });

  it('rejects pausing an upcoming session', async () => {
    vi.useFakeTimers(); vi.setSystemTime(fixedNow);
    const repository = { findById: vi.fn().mockResolvedValue(makeAssignment()), update: vi.fn() } as unknown as IAssignmentRepository;
    await expect(new ControlSessionUseCase(repository).execute('assignment-1', { action: 'PAUSE' })).rejects.toThrow(/đang mở/i);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
