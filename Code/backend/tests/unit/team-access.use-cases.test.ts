import { describe, expect, it, vi } from 'vitest';
import { CreateTeamUseCase } from '../../src/modules/team/application/use-cases/create-team.use-case.js';
import { ManageTeamUseCase } from '../../src/modules/team/application/use-cases/manage-team.use-case.js';
import type { ITeamRepository } from '../../src/modules/team/domain/repositories/team.repository.interface.js';
import type { ICourseRepository } from '../../src/modules/course/domain/repositories/course.repository.interface.js';
import type { IUserRepository } from '../../src/modules/user/domain/repositories/user.repository.interface.js';

const createCourseRepository = (overrides: Partial<ICourseRepository> = {}) => ({
  findById: vi.fn().mockResolvedValue({ lecturerId: 'lecturer-1' }),
  isStudentEnrolled: vi.fn().mockResolvedValue(true),
  ...overrides,
}) as unknown as ICourseRepository;

describe('Team access use cases', () => {
  it('rejects creating a team when the leader is not enrolled in the course', async () => {
    const courseRepository = createCourseRepository({
      isStudentEnrolled: vi.fn().mockResolvedValue(false),
    });
    const teamRepository = {
      findByUserAndCourse: vi.fn(),
      create: vi.fn(),
    } as unknown as ITeamRepository;
    const useCase = new CreateTeamUseCase(teamRepository, courseRepository);

    await expect(useCase.execute({
      courseId: 'course-1',
      name: 'Team One',
      leaderId: 'student-1',
    })).rejects.toThrow('Bạn cần ghi danh môn học trước khi tạo nhóm.');

    expect(teamRepository.findByUserAndCourse).not.toHaveBeenCalled();
    expect(teamRepository.create).not.toHaveBeenCalled();
  });

  it('rejects creating a team for a course that does not exist', async () => {
    const courseRepository = createCourseRepository({ findById: vi.fn().mockResolvedValue(null) });
    const teamRepository = { create: vi.fn() } as unknown as ITeamRepository;
    const useCase = new CreateTeamUseCase(teamRepository, courseRepository);

    await expect(useCase.execute({
      courseId: 'missing-course',
      name: 'Team One',
      leaderId: 'student-1',
    })).rejects.toThrow('Không tìm thấy môn học.');
    expect(teamRepository.create).not.toHaveBeenCalled();
  });

  it('allows only enrolled students or the course lecturer/admin to list course teams', async () => {
    const courseRepository = createCourseRepository({
      isStudentEnrolled: vi.fn().mockResolvedValue(false),
    });
    const teamRepository = { findByCourse: vi.fn().mockResolvedValue([]) } as unknown as ITeamRepository;
    const userRepository = {} as IUserRepository;
    const useCase = new ManageTeamUseCase(teamRepository, userRepository, courseRepository);

    await expect(useCase.getCourseTeams('course-1', { userId: 'student-2', role: 'STUDENT' }))
      .rejects.toThrow('Bạn không có quyền xem danh sách nhóm của môn học này.');
    expect(teamRepository.findByCourse).not.toHaveBeenCalled();

    await expect(useCase.getCourseTeams('course-1', { userId: 'lecturer-1', role: 'LECTURER' }))
      .resolves.toEqual([]);
    expect(teamRepository.findByCourse).toHaveBeenCalledTimes(1);
  });

  it('checks course access before returning team details', async () => {
    const courseRepository = createCourseRepository({
      isStudentEnrolled: vi.fn().mockResolvedValue(false),
    });
    const team = { courseId: 'course-1' };
    const teamRepository = { findById: vi.fn().mockResolvedValue(team) } as unknown as ITeamRepository;
    const useCase = new ManageTeamUseCase(teamRepository, {} as IUserRepository, courseRepository);

    await expect(useCase.getTeamDetails('team-1', { userId: 'outsider', role: 'STUDENT' }))
      .rejects.toThrow('Bạn không có quyền xem danh sách nhóm của môn học này.');
  });
});
