import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { Submission } from '../../domain/entities/submission.entity.js';
import { IArtifactExtractor } from '../services/artifact-extractor.interface.js';
import { IGradingDispatcher } from '../services/grading-dispatcher.interface.js';
import { SubmitAssignmentInput } from '../dtos/submission.dto.js';
import { GitIngestionService, gitIngestionService } from '../../infrastructure/storage/git-ingestion.service.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export interface SubmitAssignmentDeps {
  submissionRepository: ISubmissionRepository;
  artifactExtractor: IArtifactExtractor;
  gradingDispatcher: IGradingDispatcher;
  gitIngestion?: GitIngestionService;
}

export interface SubmitAssignmentRequest extends SubmitAssignmentInput {
  userId: string;
  uploadedZipPath?: string;
  uploadedZipSize?: number;
}

export class SubmitAssignmentUseCase {
  private readonly gitIngestion: GitIngestionService;

  constructor(private readonly deps: SubmitAssignmentDeps) {
    this.gitIngestion = deps.gitIngestion || gitIngestionService;
  }

  public async execute(request: SubmitAssignmentRequest): Promise<Submission> {
    const { submissionRepository, artifactExtractor, gradingDispatcher } = this.deps;

    if (request.submissionChannel === 'ZIP_UPLOAD' && !request.uploadedZipPath) {
      throw new ValidationError('File .zip bài nộp là bắt buộc cho hình thức nộp ZIP_UPLOAD');
    }

    if (request.submissionChannel === 'GIT_COMMIT' && !request.gitRepoUrl) {
      throw new ValidationError('Đường dẫn GitHub repository là bắt buộc cho hình thức nộp GIT_COMMIT');
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

    if (request.submissionChannel === 'GIT_COMMIT' && request.gitRepoUrl) {
      try {
        const gitResult = await this.gitIngestion.cloneAndAnalyze(
          request.gitRepoUrl,
          request.gitCommitHash,
          submission.id
        );

        const updated = await submissionRepository.updateGitMetadata(submission.id, {
          commitCount: gitResult.commitCount,
          locChurn: gitResult.locChurn,
          gitCommitHash: gitResult.resolvedCommitHash,
          contributors: gitResult.contributors,
        });


        await gradingDispatcher.dispatch(submission.id, gitResult.stagedPath);

        return updated;
      } catch (error) {
        await submissionRepository.updateStatus(submission.id, 'FAILED');
        throw error;
      }
    }

    // Default fallback dispatch
    await gradingDispatcher.dispatch(submission.id, '');

    return submission;
  }
}

