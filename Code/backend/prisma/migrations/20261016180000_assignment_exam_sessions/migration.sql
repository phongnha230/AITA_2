ALTER TABLE `assignments`
  MODIFY COLUMN `status` ENUM('DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN `paused_at` DATETIME(3) NULL;

CREATE TABLE `assignment_exam_access` (
  `id` CHAR(36) NOT NULL,
  `assignment_id` CHAR(36) NOT NULL,
  `student_id` CHAR(36) NOT NULL,
  `unlocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_exam_access_assignment_student` (`assignment_id`, `student_id`),
  INDEX `idx_exam_access_student_unlocked` (`student_id`, `unlocked_at`),
  CONSTRAINT `assignment_exam_access_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assignment_exam_access_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
