import { describe, expect, it, vi } from 'vitest';
import { ManageAiTutorConfigUseCase } from '../../src/modules/ai/application/use-cases/manage-ai-tutor-config.use-case.js';
import { ForbiddenError } from '../../src/shared/domain/exceptions/app.error.js';
import { UpdateAiTutorConfigSchema } from '../../src/modules/ai/application/dtos/ai-tutor-config.dto.js';

describe('ManageAiTutorConfigUseCase', () => {
  it('validates mode, prompt size, and temperature bounds', () => {
    const baseConfig = { socraticMode: 'BALANCED', customPrompt: '', temperature: 0.7, enableContext: true };
    expect(UpdateAiTutorConfigSchema.safeParse(baseConfig).success).toBe(true);
    expect(UpdateAiTutorConfigSchema.safeParse({ ...baseConfig, temperature: 0.09 }).success).toBe(false);
    expect(UpdateAiTutorConfigSchema.safeParse({ ...baseConfig, customPrompt: 'x'.repeat(4001) }).success).toBe(false);
    expect(UpdateAiTutorConfigSchema.safeParse({ ...baseConfig, unexpected: true }).success).toBe(false);
  });

  it('returns safe defaults when a course has no saved configuration', async () => {
    const repository = {
      getCourseLecturerId: vi.fn().mockResolvedValue('lecturer-1'),
      getCourseTutorConfig: vi.fn().mockResolvedValue(null),
    };
    const useCase = new ManageAiTutorConfigUseCase(repository as never);

    await expect(useCase.get('course-1', 'lecturer-1', 'LECTURER')).resolves.toMatchObject({
      courseId: 'course-1',
      socraticMode: 'BALANCED',
      customPrompt: '',
      temperature: 0.7,
      enableContext: true,
    });
  });

  it('rejects a lecturer who does not own the course', async () => {
    const repository = { getCourseLecturerId: vi.fn().mockResolvedValue('owner-1') };
    const useCase = new ManageAiTutorConfigUseCase(repository as never);

    await expect(useCase.get('course-1', 'lecturer-2', 'LECTURER')).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('allows an admin and records the actor on save', async () => {
    const savedConfig = { courseId: 'course-1', socraticMode: 'LENIENT', customPrompt: '', temperature: 0.4, enableContext: false, updatedAt: new Date() };
    const repository = {
      getCourseLecturerId: vi.fn().mockResolvedValue('owner-1'),
      saveCourseTutorConfig: vi.fn().mockResolvedValue(savedConfig),
    };
    const useCase = new ManageAiTutorConfigUseCase(repository as never);

    await useCase.save('course-1', 'admin-1', 'ADMIN', {
      socraticMode: 'LENIENT', customPrompt: '', temperature: 0.4, enableContext: false,
    });
    expect(repository.saveCourseTutorConfig).toHaveBeenCalledWith(expect.objectContaining({
      courseId: 'course-1', updatedById: 'admin-1', enableContext: false,
    }));
  });
});
