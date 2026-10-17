export interface GradingEvidence {
  id: string;
  testCaseId?: string | null;
  mimeType: string;
  fileSize: number;
  sha256: string;
}

export interface GradingRunStage {
  id: string;
  stageKey: string;
  status: string;
  score?: number | string | null;
  maxScore?: number | string | null;
  detailsJson?: Record<string, unknown> | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  evidence?: GradingEvidence[];
}

export interface GradingRun {
  id: string;
  runNo: number;
  status: string;
  approvalMode?: 'LECTURER_REVIEW' | 'AUTO_PUBLISH';
  summaryJson?: Record<string, unknown> | null;
  snapshotJson?: Record<string, unknown> | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  stages: GradingRunStage[];
}
