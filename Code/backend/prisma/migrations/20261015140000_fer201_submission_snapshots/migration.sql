ALTER TABLE `submissions`
  ADD COLUMN IF NOT EXISTS `deployed_url` VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS `workspace_path` VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS `attempt_no` INTEGER NOT NULL DEFAULT 1;

ALTER TABLE `team_members`
  ADD COLUMN IF NOT EXISTS `git_author_email` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `github_username` VARCHAR(100) NULL;

ALTER TABLE `git_contributors`
  ADD COLUMN IF NOT EXISTS `matched_user_id` CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS `active_days` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `first_commit_at` DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS `last_commit_at` DATETIME(3) NULL;

CREATE TABLE IF NOT EXISTS `submission_participants` (
  `id` CHAR(36) NOT NULL,
  `submission_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `team_role` VARCHAR(50) NOT NULL,
  `adjusted_score` DECIMAL(4, 2) NULL,
  `adjustment_reason` VARCHAR(500) NULL,
  `adjusted_by_id` CHAR(36) NULL,
  `adjusted_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `uk_submission_participant` (`submission_id`, `user_id`),
  INDEX `idx_submission_participant_user` (`user_id`),
  INDEX `idx_submission_participant_adjuster` (`adjusted_by_id`),
  CONSTRAINT `submission_participants_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `submission_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `submission_participants_adjusted_by_id_fkey` FOREIGN KEY (`adjusted_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `participant_score_adjustments` (
  `id` CHAR(36) NOT NULL,
  `submission_participant_id` CHAR(36) NOT NULL,
  `previous_score` DECIMAL(4, 2) NULL,
  `adjusted_score` DECIMAL(4, 2) NULL,
  `reason` VARCHAR(500) NOT NULL,
  `adjusted_by_id` CHAR(36) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_score_adjustment_participant` (`submission_participant_id`),
  INDEX `idx_score_adjustment_actor` (`adjusted_by_id`),
  CONSTRAINT `participant_score_adjustments_participant_id_fkey` FOREIGN KEY (`submission_participant_id`) REFERENCES `submission_participants`(`id`) ON DELETE CASCADE,
  CONSTRAINT `participant_score_adjustments_adjusted_by_id_fkey` FOREIGN KEY (`adjusted_by_id`) REFERENCES `users`(`id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TEMPORARY TABLE `submission_attempt_backfill` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `attempt_no` BIGINT NOT NULL
);

INSERT INTO `submission_attempt_backfill` (`id`, `attempt_no`)
SELECT
  `id`,
  ROW_NUMBER() OVER (
    PARTITION BY `assignment_id`, COALESCE(`team_id`, CONCAT('user:', `user_id`))
    ORDER BY `submitted_at`, `id`
  ) AS `attempt_no`
FROM `submissions`;

UPDATE `submissions` AS `submission`
JOIN `submission_attempt_backfill` AS `backfill` ON `backfill`.`id` = `submission`.`id`
SET `submission`.`attempt_no` = `backfill`.`attempt_no`;

DROP TEMPORARY TABLE `submission_attempt_backfill`;

CREATE UNIQUE INDEX `uk_sub_assignment_team_attempt` ON `submissions`(`assignment_id`, `team_id`, `attempt_no`);
CREATE UNIQUE INDEX `uk_sub_assignment_user_attempt` ON `submissions`(`assignment_id`, `user_id`, `attempt_no`);
CREATE UNIQUE INDEX `uk_team_member_git_email` ON `team_members`(`team_id`, `git_author_email`);
CREATE UNIQUE INDEX `uk_team_member_github_username` ON `team_members`(`team_id`, `github_username`);
CREATE INDEX `idx_contributors_matched_user` ON `git_contributors`(`matched_user_id`);
ALTER TABLE `git_contributors`
  ADD CONSTRAINT `git_contributors_matched_user_id_fkey`
  FOREIGN KEY (`matched_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;
