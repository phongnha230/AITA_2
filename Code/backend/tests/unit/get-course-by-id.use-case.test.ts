import { describe, expect, it, vi } from 'vitest';
import { Course } from '../../src/modules/course/domain/entities/course.entity.js';
import type { ICourseRepository } from '../../src/modules/course/domain/repositories/course.repository.interface.js';
import { GetCourseByIdUseCase } from '../../src/modules/course/application/use-cases/get-course-by-id.use-case.js';

const course = new Course({
  id: 'course-1',
  code: 'CSD201',
  name: 'Data Structures',
  semester: 'Fall 2026',
  lecturerId: 'lecturer-1',
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
});

function createUseCase(isStudentEnrolled = false) {
  const repository = {
    findById: vi.fn().mockResolvedValue(course),
    findDetailedById: vi.fn().mockResolvedValue({ id: course.id, lecturerId: course.lecturerId }),
    isStudentEnrolled: vi.fn().mockResolvedValue(isStudentEnrolled),
  } as unknown as ICourseRepository;

  return { repository, useCase: new GetCourseByIdUseCase(repository) };
}

describe('GetCourseByIdUseCase role isolation', () => {
  it('allows an admin to read any course', async () => {
    const { repository, useCase } = createUseCase();

    await expect(useCase.execute('course-1', { userId: 'admin-1', role: 'ADMIN' }))
      .resolves.toMatchObject({ id: 'course-1' });
    expect(repository.isStudentEnrolled).not.toHaveBeenCalled();
  });

  it('allows the owning lecturer and blocks another lecturer', async () => {
    const { repository, useCase } = createUseCase();

    await expect(useCase.execute('course-1', { userId: 'lecturer-1', role: 'LECTURER' }))
      .resolves.toMatchObject({ id: 'course-1' });
    await expect(useCase.execute('course-1', { userId: 'lecturer-2', role: 'LECTURER' }))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(repository.findDetailedById).toHaveBeenCalledTimes(1);
  });

  it('allows an enrolled student and hides whether an unjoined course exists', async () => {
    const enrolled = createUseCase(true);
    await expect(enrolled.useCase.execute('course-1', { userId: 'student-1', role: 'STUDENT' }))
      .resolves.toMatchObject({ id: 'course-1' });

    const notEnrolled = createUseCase(false);
    await expect(notEnrolled.useCase.execute('course-1', { userId: 'student-2', role: 'STUDENT' }))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(notEnrolled.repository.findDetailedById).not.toHaveBeenCalled();
  });

  it('returns not found before checking access for a missing course', async () => {
    const { repository, useCase } = createUseCase();
    vi.mocked(repository.findById).mockResolvedValue(null);

    await expect(useCase.execute('missing', { userId: 'lecturer-1', role: 'LECTURER' }))
      .rejects.toMatchObject({ statusCode: 404 });
    expect(repository.findDetailedById).not.toHaveBeenCalled();
  });
});
