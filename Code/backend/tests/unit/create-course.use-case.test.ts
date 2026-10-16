import { describe, expect, it, vi } from 'vitest';
import { CreateCourseUseCase } from '../../src/modules/course/application/use-cases/create-course.use-case.js';
import type { ICourseRepository } from '../../src/modules/course/domain/repositories/course.repository.interface.js';
import type { IUserRepository } from '../../src/modules/user/domain/repositories/user.repository.interface.js';

describe('CreateCourseUseCase', () => {
  it('rejects assigning a course to a non-lecturer account', async () => {
    const findById = vi.fn().mockResolvedValue({ role: 'STUDENT' });
    const courseRepository = { findByCodeAndSemester: vi.fn(), create: vi.fn() } as unknown as ICourseRepository;
    const userRepository = { findById } as unknown as IUserRepository;
    const useCase = new CreateCourseUseCase(courseRepository, userRepository);

    await expect(useCase.execute({ code: 'CSD201', name: 'Data Structures', semester: 'Fall 2026', lecturerId: 'user-1' }))
      .rejects.toThrow('Khóa học phải được giao cho tài khoản giảng viên.');
    expect(courseRepository.create).not.toHaveBeenCalled();
  });
});
