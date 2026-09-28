import { ISubmissionRepository } from '../../../domain/repositories/submission.repository.interface.js';
import { SubmissionEntity } from '../../../domain/entities/submission.entity.js';
import { IArtifactExtractor } from '../../services/artifact-extractor.interface.js';
import { IGradingDispatcher } from '../../services/grading-dispatcher.interface.js';
import { SubmitAssignmentInput } from '../../dtos/submission.dto.js';
import { ValidationError } from '../../../shared/errors/app-error.js';

export interface SubmitAssignmentDeps {
  submissionRepository: ISubmissionRepository;
  artifactExtractor: IArtifactExtractor;
  gradingDispatcher: IGradingDispatcher;
}

export interface SubmitAssignmentRequest extends SubmitAssignmentInput {
  studentId: string;
  /** Absolute path of the uploaded .zip on disk (from Multer), required when submissionType = ZIP_FILE. */
  uploadedZipPath?: string;
}

export class SubmitAssignmentUseCase {
  constructor(private readonly deps: SubmitAssignmentDeps) {}

  public async execute(request: SubmitAssignmentRequest): Promise<SubmissionEntity> {
    const { submissionRepository, artifactExtractor, gradingDispatcher } = this.deps;

    if (request.submissionType === 'ZIP_FILE' && !request.uploadedZipPath) {
      throw new ValidationError('File .zip bài nộp là bắt buộc cho submissionType = ZIP_FILE');
    }

    const submission = await submissionRepository.create({
      assignmentId: request.assignmentId,
      studentId: request.studentId,
      teamId: request.teamId ?? null,
      submissionType: request.submissionType,
      gitCommitHash: request.gitCommitHash ?? null,
    });

    if (request.submissionType === 'ZIP_FILE' && request.uploadedZipPath) {
      try {
        const stagingResult = await artifactExtractor.extractAndStage(
          request.uploadedZipPath,
          submission.id
        );

        const stagedSubmission = await submissionRepository.attachStagedPath(
          submission.id,
          stagingResult.stagedPath
        );

        await gradingDispatcher.dispatch(submission.id, stagingResult.stagedPath);

        return stagedSubmission;
      } catch (error) {
        // The submission row must not stay stuck at PENDING with no staged
        // artifact — surface the failure on the record before rethrowing.
        await submissionRepository.markFailed(submission.id);
        throw error;
      }
    }

    // GIT_REPO submissions have no local artifact to stage; TV4's dispatcher
    // (or a future git-clone step) is handed the commit hash via the DB record.
    await gradingDispatcher.dispatch(submission.id, '');

    return submission;
  }
}
