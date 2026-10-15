ALTER TABLE `assignments`
    ADD COLUMN `grading_version` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `functional_max_score` DECIMAL(4, 2) NOT NULL DEFAULT 8.00,
    ADD COLUMN `algorithm_max_score` DECIMAL(4, 2) NOT NULL DEFAULT 2.00,
    ADD COLUMN `clean_code_max_score` DECIMAL(4, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE `rubric_rules`
    ADD COLUMN `criterion_type` ENUM('GENERAL', 'ALGORITHM', 'CLEAN_CODE') NOT NULL DEFAULT 'GENERAL';

ALTER TABLE `assignment_solutions`
    ADD COLUMN `expected_time_complexity` VARCHAR(100) NULL,
    ADD COLUMN `expected_space_complexity` VARCHAR(100) NULL;

ALTER TABLE `submissions`
    ADD COLUMN `algorithm_score` DECIMAL(4, 2) NULL,
    ADD COLUMN `clean_code_score` DECIMAL(4, 2) NULL;
