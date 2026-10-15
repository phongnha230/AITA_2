ALTER TABLE `assignment_solutions`
  ADD COLUMN `active_key` CHAR(36) NULL,
  ADD COLUMN `content_hash` CHAR(64) NULL,
  ADD COLUMN `index_status` ENUM('PENDING', 'READY', 'FAILED') NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `indexed_at` DATETIME(3) NULL,
  ADD COLUMN `index_error` LONGTEXT NULL,
  ADD COLUMN `embedding_model` VARCHAR(100) NULL,
  ADD COLUMN `chunker_version` VARCHAR(50) NULL;

UPDATE `assignment_solutions`
SET `content_hash` = SHA2(`source_code`, 256),
    `is_active` = FALSE,
    `active_key` = NULL;

UPDATE `assignment_solutions` AS solution
JOIN (
  SELECT `id`
  FROM (
    SELECT
      `id`,
      ROW_NUMBER() OVER (
        PARTITION BY `assignment_id`
        ORDER BY `created_at` DESC, `id` DESC
      ) AS `row_number`
    FROM `assignment_solutions`
  ) AS ranked
  WHERE ranked.`row_number` = 1
) AS latest
  ON latest.`id` = solution.`id`
SET solution.`is_active` = TRUE,
    solution.`active_key` = solution.`assignment_id`;

ALTER TABLE `assignment_solutions`
  MODIFY COLUMN `content_hash` CHAR(64) NOT NULL,
  ADD UNIQUE INDEX `assignment_solutions_active_key_key` (`active_key`);

ALTER TABLE `grading_jobs`
  MODIFY COLUMN `error_stage` ENUM(
    'STAGING',
    'SANDBOX_COMPILATION',
    'SANDBOX_EXECUTION',
    'AI_EVALUATION',
    'AI_RAG',
    'INPUT_TOO_LARGE',
    'SYSTEM'
  ) NULL;
