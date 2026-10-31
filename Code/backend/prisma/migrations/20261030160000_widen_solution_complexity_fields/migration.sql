-- AlterTable: Widen complexity fields from VARCHAR(100) to VARCHAR(500)
-- to allow longer algorithm complexity descriptions

ALTER TABLE `assignment_solutions` MODIFY COLUMN `expected_time_complexity` VARCHAR(500) NULL;
ALTER TABLE `assignment_solutions` MODIFY COLUMN `expected_space_complexity` VARCHAR(500) NULL;
