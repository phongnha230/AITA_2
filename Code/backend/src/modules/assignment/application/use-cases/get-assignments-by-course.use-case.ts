import { IAssignmentRepository } from '../../domain/repositories/assignment.repository.interface.js';

export class GetAssignmentsByCourseUseCase {
  constructor(private readonly assignmentRepository: IAssignmentRepository) {}

  async execute(courseId: string, viewerRole?: string) {
    const assignments = await this.assignmentRepository.findByCourseId(courseId);
    if (viewerRole !== 'STUDENT') return assignments;
    return assignments.map(({ description, accessCode, pdfFilePath, starterCodePath, ...metadata }) => {
      void description;
      void accessCode;
      void pdfFilePath;
      void starterCodePath;
      return metadata;
    });
  }
}
