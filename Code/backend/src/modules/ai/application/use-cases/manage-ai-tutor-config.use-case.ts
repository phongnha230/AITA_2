import { ForbiddenError, NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';
import { DEFAULT_AI_TUTOR_CONFIG } from '../../domain/ai-tutor-config.js';
import { IAiTutorRepository, SaveAiTutorConfigData } from '../../domain/repositories/ai-tutor.repository.interface.js';

export class ManageAiTutorConfigUseCase {
  constructor(private readonly aiTutorRepository: IAiTutorRepository) {}

  private async assertCourseAccess(courseId: string, userId: string, role: string): Promise<void> {
    const lecturerId = await this.aiTutorRepository.getCourseLecturerId(courseId);
    if (!lecturerId) throw new NotFoundError(`Khóa học với ID: ${courseId}`);
    if (role !== 'ADMIN' && !(role === 'LECTURER' && lecturerId === userId)) {
      throw new ForbiddenError('Bạn không có quyền cấu hình AI Tutor cho khóa học này.');
    }
  }

  async get(courseId: string, userId: string, role: string) {
    await this.assertCourseAccess(courseId, userId, role);
    const config = await this.aiTutorRepository.getCourseTutorConfig(courseId);
    return config ?? { ...DEFAULT_AI_TUTOR_CONFIG, courseId };
  }

  async save(courseId: string, userId: string, role: string, input: Omit<SaveAiTutorConfigData, 'courseId' | 'updatedById'>) {
    await this.assertCourseAccess(courseId, userId, role);
    return this.aiTutorRepository.saveCourseTutorConfig({
      ...input,
      courseId,
      updatedById: userId,
    });
  }
}
