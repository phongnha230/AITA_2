import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { IAssignmentRepository } from '../../../assignment/domain/repositories/assignment.repository.interface.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';
import { Submission } from '../../domain/entities/submission.entity.js';
import { IArtifactExtractor } from '../services/artifact-extractor.interface.js';
import { IGradingDispatcher } from '../services/grading-dispatcher.interface.js';
import { SubmitAssignmentInput } from '../dtos/submission.dto.js';
import { GitIngestionService, gitIngestionService } from '../../infrastructure/storage/git-ingestion.service.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../../shared/domain/exceptions/app.error.js';

export interface SubmitAssignmentDeps {
  submissionRepository: ISubmissionRepository;
  assignmentRepository: IAssignmentRepository;
  courseRepository: ICourseRepository;
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
    const {
      submissionRepository,
      assignmentRepository,
      courseRepository,
      artifactExtractor,
      gradingDispatcher,
    } = this.deps;

    // 1. Kiểm tra đề thi có tồn tại và đang mở không
    const assignment = await assignmentRepository.findById(request.assignmentId);

    if (!assignment) {
      throw new NotFoundError(`Đề thi với ID: ${request.assignmentId}`);
    }

    if (assignment.status === 'DRAFT') {
      throw new ForbiddenError('Đề thi này chưa được mở (trạng thái DRAFT).');
    }

    if (assignment.status === 'CLOSED') {
      throw new ForbiddenError('Đề thi này đã đóng nộp bài (trạng thái CLOSED).');
    }

    const now = new Date();
    if (now < assignment.startTime) {
      throw new ForbiddenError(
        `Chưa đến thời gian làm bài! Đề thi sẽ mở lúc ${assignment.startTime.toLocaleString('vi-VN')}`
      );
    }

    if (now > assignment.deadline) {
      throw new ForbiddenError(
        `Đã hết hạn nộp bài! Hạn chót nộp bài là ${assignment.deadline.toLocaleString('vi-VN')}`
      );
    }

    // 2. Kiểm tra Passcode mở đề nếu có cấu hình
    if (assignment.accessCode) {
      if (!assignment.verifyAccessCode(request.accessCode)) {
        throw new ForbiddenError('Mã mở đề (Passcode) không chính xác hoặc chưa được cung cấp.');
      }
    }

    // 3. Kiểm tra sinh viên đã ghi danh môn học chứa đề thi chưa
    const isEnrolled = await courseRepository.isStudentEnrolled(
      assignment.courseId,
      request.userId
    );

    if (!isEnrolled) {
      throw new ForbiddenError('Bạn chưa được ghi danh vào môn học này, không thể nộp bài.');
    }

    // 4. Kiểm tra tần suất nộp bài (Anti-Spam / Cooldown 10 giây giữa 2 lần nộp)
    const latestSubmission = await submissionRepository.findLatestByAssignmentAndUser(
      request.assignmentId,
      request.userId
    );

    if (latestSubmission) {
      const timeSinceLastSubmitMs = now.getTime() - new Date(latestSubmission.submittedAt).getTime();
      const COOLDOWN_SECONDS = 10;
      if (timeSinceLastSubmitMs < COOLDOWN_SECONDS * 1000) {
        const waitSeconds = Math.ceil((COOLDOWN_SECONDS * 1000 - timeSinceLastSubmitMs) / 1000);
        throw new ValidationError(
          `Bạn đang nộp bài quá nhanh. Vui lòng đợi thêm ${waitSeconds} giây trước khi nộp bài tiếp theo.`
        );
      }
    }

    // 5. Kiểm tra kênh nộp bài
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
      paperCode: request.paperCode ?? null,
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

    return submission;
  }
}
