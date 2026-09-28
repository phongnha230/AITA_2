import { CreateSubmissionProps, SubmissionEntity } from '../entities/submission.entity.js';

export interface SubmissionWithJobStatus extends SubmissionEntity {
  gradingJobStatus: string | null;
}

export interface ISubmissionRepository {
  create(props: CreateSubmissionProps): Promise<SubmissionEntity>;
  attachStagedPath(id: string, stagedPath: string): Promise<SubmissionEntity>;
  markFailed(id: string): Promise<SubmissionEntity>;
  findById(id: string): Promise<SubmissionWithJobStatus | null>;
}
