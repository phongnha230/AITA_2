import { IAssignmentRepository } from '../../../assignment/domain/repositories/assignment.repository.interface.js';
import { ITeamRepository } from '../../../team/domain/repositories/team.repository.interface.js';
import { Submission } from '../../domain/entities/submission.entity.js';
import { ISubmissionRepository } from '../../domain/repositories/submission.repository.interface.js';
import { IGradingDispatcher } from '../services/grading-dispatcher.interface.js';
import { GitIngestionService, gitIngestionService } from '../../infrastructure/storage/git-ingestion.service.js';
import { validatePublicDeploymentUrl } from '../../infrastructure/storage/deployed-url.validator.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { env } from '../../../../infrastructure/config/env.js';
import { logger } from '../../../../infrastructure/logging/logger.js';

export interface SubmitTeamAssignmentRequest {
  assignmentId: string;
  teamId: string;
  userId: string;
  gitCommitHash?: string;
}

export interface SubmitTeamAssignmentDeps {
  assignmentRepository: IAssignmentRepository;
  teamRepository: ITeamRepository;
  submissionRepository: ISubmissionRepository;
  gradingDispatcher: IGradingDispatcher;
  gitIngestion?: GitIngestionService;
}

export class SubmitTeamAssignmentUseCase {
  private readonly gitIngestion: GitIngestionService;

  constructor(private readonly deps: SubmitTeamAssignmentDeps) {
    this.gitIngestion = deps.gitIngestion ?? gitIngestionService;
  }

  public async execute(request: SubmitTeamAssignmentRequest): Promise<Submission> {
    if (!env.FER201_GRADING_ENABLED) {
      throw new ForbiddenError('Chức năng chấm FER201 hiện chưa được bật.');
    }

    const assignment = await this.deps.assignmentRepository.findById(request.assignmentId);
    if (!assignment) throw new NotFoundError(`Đề thi với ID: ${request.assignmentId}`);
    if (assignment.environment !== 'REACT_JS' || assignment.submissionType !== 'GROUP') {
      throw new ValidationError('Endpoint này chỉ dùng cho assignment REACT_JS + GROUP.');
    }
    if (!assignment.allowGitSubmission) {
      throw new ForbiddenError('Đề thi này không cho phép nộp bài bằng GitHub.');
    }
    const now = new Date();
    if (assignment.status === 'PAUSED') throw new ForbiddenError('Ca thi đang tạm dừng, hiện không thể nộp bài.');
    if (assignment.status !== 'PUBLISHED' || now < assignment.startTime || now > assignment.deadline) {
      throw new ForbiddenError('Assignment chưa mở hoặc đã hết hạn nộp bài.');
    }
    if (!(await this.deps.assignmentRepository.hasStudentExamAccess(assignment.id, request.userId))) {
      throw new ForbiddenError('Hãy nhập mã đề để mở ca trước khi nộp bài.');
    }

    const team = await this.deps.teamRepository.findById(request.teamId);
    if (!team) throw new NotFoundError(`Nhóm với ID: ${request.teamId}`);
    if (team.courseId !== assignment.courseId) {
      throw new ValidationError('Nhóm không thuộc môn học của assignment.');
    }
    if (team.leaderId !== request.userId) {
      throw new ForbiddenError('Chỉ Leader của nhóm mới được nộp bài.');
    }
    if (!team.gitRepoUrl) throw new ValidationError('Nhóm chưa cập nhật GitHub repository.');
    if (!team.deployedUrl) throw new ValidationError('Nhóm chưa cập nhật URL deploy.');
    const deployedUrl = await validatePublicDeploymentUrl(team.deployedUrl);
    const members = team.members ?? [];
    if (members.length === 0) throw new ValidationError('Nhóm không có thành viên để snapshot.');

    const latest = await this.deps.submissionRepository.findLatestByAssignmentAndTeam(
      assignment.id,
      team.id
    );
    if (latest && now.getTime() - latest.submittedAt.getTime() < 10_000) {
      throw new ValidationError('Vui lòng đợi 10 giây trước khi nộp attempt tiếp theo.');
    }

    const submission = await this.deps.submissionRepository.create({
      assignmentId: assignment.id,
      userId: request.userId,
      teamId: team.id,
      groupLabel: team.name,
      submissionChannel: 'GIT_COMMIT',
      gitRepoUrl: team.gitRepoUrl,
      gitCommitHash: request.gitCommitHash ?? null,
      deployedUrl,
      participants: members.map((member) => ({ userId: member.userId, teamRole: member.role })),
    });

    try {
      const gitResult = await this.gitIngestion.cloneAndAnalyze(
        team.gitRepoUrl,
        request.gitCommitHash,
        submission.id,
        assignment.maxFileSizeBytes,
        {
          since: assignment.startTime,
          until: submission.submittedAt,
          participantIdentities: members.map((member) => ({
            userId: member.userId,
            accountEmail: member.user?.email,
            gitAuthorEmail: member.gitAuthorEmail,
            githubUsername: member.githubUsername,
          })),
        }
      );
      await this.deps.submissionRepository.updateWorkspacePath(submission.id, gitResult.stagedPath);
      const updated = await this.deps.submissionRepository.updateGitMetadata(submission.id, {
        commitCount: gitResult.commitCount,
        locChurn: gitResult.locChurn,
        gitCommitHash: gitResult.resolvedCommitHash,
        contributors: gitResult.contributors,
      });
      await this.deps.gradingDispatcher.dispatch(submission.id, gitResult.stagedPath);
      return updated;
    } catch (error) {
      logger.error('team_submission_preprocessing_failed', {
        submissionId: submission.id,
        teamId: team.id,
        stage: 'PREPROCESSING',
        error,
      });
      await this.deps.submissionRepository.updateStatus(submission.id, 'FAILED');
      throw error;
    }
  }
}
