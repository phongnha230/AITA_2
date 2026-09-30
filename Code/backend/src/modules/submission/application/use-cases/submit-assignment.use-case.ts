import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { Submission } from '../../domain/entities/submission.entity.js';
import { IArtifactExtractor } from '../services/artifact-extractor.interface.js';
import { IGradingDispatcher } from '../services/grading-dispatcher.interface.js';
import { SubmitAssignmentInput } from '../dtos/submission.dto.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export interface SubmitAssignmentDeps {
  submissionRepository: ISubmissionRepository;
  artifactExtractor: IArtifactExtractor;
  gradingDispatcher: IGradingDispatcher;
}

export interface SubmitAssignmentRequest extends SubmitAssignmentInput {
  userId: string;
  uploadedZipPath?: string;
  uploadedZipSize?: number;
}

export class SubmitAssignmentUseCase {
  constructor(private readonly deps: SubmitAssignmentDeps) {}

  public async execute(request: SubmitAssignmentRequest): Promise<Submission> {
    const { submissionRepository, artifactExtractor, gradingDispatcher } = this.deps;

    if (request.submissionChannel === 'ZIP_UPLOAD' && !request.uploadedZipPath) {
      throw new ValidationError('File .zip bài nộp là bắt buộc cho hình thức nộp ZIP_UPLOAD');
    }

    const submission = await submissionRepository.create({
      assignmentId: request.assignmentId,
      userId: request.userId,
      groupLabel: request.groupLabel ?? null,
      submissionChannel: request.submissionChannel,
      zipFilePath: request.uploadedZipPath ?? null,
      zipFileSize: request.uploadedZipSize ?? null,
      gitRepoUrl: request.gitRepoUrl ?? null,
      gitCommitHash: request.gitCommitHash ?? null,
    });

    if (request.submissionChannel === 'ZIP_UPLOAD' && request.uploadedZipPath) {
      try {
        const stagingResult = await artifactExtractor.extractAndStage(
          request.uploadedZipPath,
          submission.id
        );

        const updated = await submissionRepository.updateZipFilePath(
          submission.id,
          stagingResult.stagedPath
        );

        await gradingDispatcher.dispatch(submission.id, stagingResult.stagedPath);

        return updated;
      } catch (error) {
        await submissionRepository.updateStatus(submission.id, 'FAILED');
        throw error;
      }
    }

    // GIT_COMMIT channel dispatch
    await gradingDispatcher.dispatch(submission.id, '');

    return submission;
  }
}
