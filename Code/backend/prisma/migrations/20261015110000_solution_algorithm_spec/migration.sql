ALTER TABLE `assignment_solutions`
    ADD COLUMN `accepted_strategies` JSON NULL,
    ADD COLUMN `algorithm_notes` LONGTEXT NULL;
