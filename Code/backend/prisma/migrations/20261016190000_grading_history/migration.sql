ALTER TABLE `assignments`
  ADD COLUMN `grading_approval_mode` ENUM('LECTURER_REVIEW', 'AUTO_PUBLISH') NOT NULL DEFAULT 'LECTURER_REVIEW';

ALTER TABLE `submissions`
  ADD COLUMN `grading_snapshot` JSON NULL,
  ADD COLUMN `source_snapshot_path` VARCHAR(500) NULL,
  ADD COLUMN `source_snapshot_hash` CHAR(64) NULL;

ALTER TABLE `submissions`
  MODIFY `status` ENUM('PENDING', 'QUEUED', 'RUNNING_SANDBOX', 'RUNNING_AI', 'GRADED', 'REVIEW_PENDING', 'FAILED') NOT NULL DEFAULT 'PENDING';

CREATE TABLE `grading_runs` (
  `id` CHAR(36) NOT NULL,
  `submission_id` CHAR(36) NOT NULL,
  `run_no` INTEGER NOT NULL,
  `status` ENUM('QUEUED', 'RUNNING', 'FAILED', 'REVIEW_PENDING', 'PUBLISHED') NOT NULL DEFAULT 'QUEUED',
  `approval_mode` ENUM('LECTURER_REVIEW', 'AUTO_PUBLISH') NOT NULL,
  `snapshot_json` JSON NOT NULL,
  `summary_json` JSON NULL,
  `requested_by_id` CHAR(36) NULL,
  `reviewed_by_id` CHAR(36) NULL,
  `review_note` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `started_at` DATETIME(3) NULL,
  `completed_at` DATETIME(3) NULL,
  `reviewed_at` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_grading_run_submission_no` (`submission_id`, `run_no`),
  INDEX `idx_grading_runs_submission` (`submission_id`, `created_at`),
  INDEX `idx_grading_runs_status` (`status`, `created_at`),
  CONSTRAINT `grading_runs_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grading_runs_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `grading_run_stages` (
  `id` CHAR(36) NOT NULL,
  `grading_run_id` CHAR(36) NOT NULL,
  `stage_key` VARCHAR(40) NOT NULL,
  `status` VARCHAR(24) NOT NULL,
  `score` DECIMAL(5,2) NULL,
  `max_score` DECIMAL(5,2) NULL,
  `details_json` JSON NULL,
  `error_message` TEXT NULL,
  `started_at` DATETIME(3) NULL,
  `completed_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_grading_run_stage` (`grading_run_id`, `stage_key`),
  INDEX `idx_grading_run_stages_status` (`grading_run_id`, `status`),
  CONSTRAINT `grading_run_stages_grading_run_id_fkey` FOREIGN KEY (`grading_run_id`) REFERENCES `grading_runs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `grading_evidence` (
  `id` CHAR(36) NOT NULL,
  `stage_id` CHAR(36) NOT NULL,
  `test_case_id` CHAR(36) NULL,
  `storage_path` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INTEGER NOT NULL,
  `sha256` CHAR(64) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_grading_evidence_stage_test` (`stage_id`, `test_case_id`),
  CONSTRAINT `grading_evidence_stage_id_fkey` FOREIGN KEY (`stage_id`) REFERENCES `grading_run_stages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
