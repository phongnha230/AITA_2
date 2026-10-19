CREATE TABLE `ai_tutor_course_configs` (
  `id` CHAR(36) NOT NULL,
  `course_id` CHAR(36) NOT NULL,
  `socratic_mode` VARCHAR(20) NOT NULL DEFAULT 'BALANCED',
  `custom_prompt` TEXT NOT NULL,
  `temperature` DOUBLE NOT NULL DEFAULT 0.7,
  `enable_context` BOOLEAN NOT NULL DEFAULT true,
  `updated_by_id` CHAR(36) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `ai_tutor_course_configs_course_id_key` (`course_id`),
  INDEX `ai_tutor_course_configs_updated_by_id_idx` (`updated_by_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `ai_tutor_course_configs_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ai_tutor_course_configs_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
