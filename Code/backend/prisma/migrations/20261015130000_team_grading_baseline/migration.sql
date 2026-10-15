-- Baseline for databases where Team support was deployed before Prisma migration history.
CREATE TABLE IF NOT EXISTS `teams` (
  `id` CHAR(36) NOT NULL,
  `course_id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `leader_id` CHAR(36) NOT NULL,
  `project_title` VARCHAR(255) NULL,
  `git_repo_url` VARCHAR(500) NULL,
  `deployed_url` VARCHAR(500) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `uk_course_team_name` (`course_id`, `name`),
  INDEX `idx_teams_course` (`course_id`),
  INDEX `teams_leader_id_fkey` (`leader_id`),
  CONSTRAINT `teams_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
  CONSTRAINT `teams_leader_id_relation_fkey` FOREIGN KEY (`leader_id`) REFERENCES `users`(`id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `team_members` (
  `id` CHAR(36) NOT NULL,
  `team_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
  `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `uk_team_member` (`team_id`, `user_id`),
  INDEX `idx_team_members_user` (`user_id`),
  CONSTRAINT `team_members_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `git_contributors` (
  `id` CHAR(36) NOT NULL,
  `submission_id` CHAR(36) NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `author_email` VARCHAR(191) NOT NULL,
  `commit_count` INTEGER NOT NULL DEFAULT 0,
  `lines_added` INTEGER NOT NULL DEFAULT 0,
  `lines_deleted` INTEGER NOT NULL DEFAULT 0,
  `contribution_pct` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  INDEX `idx_contributors_submission` (`submission_id`),
  CONSTRAINT `git_contributors_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `submissions` ADD COLUMN IF NOT EXISTS `team_id` CHAR(36) NULL;
CREATE INDEX `idx_sub_team` ON `submissions`(`team_id`);
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_team_id_fkey`
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`);

