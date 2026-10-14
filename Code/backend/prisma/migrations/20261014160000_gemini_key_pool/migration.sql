ALTER TABLE `ai_api_keys`
    ADD COLUMN `usage_date` DATE NULL,
    ADD COLUMN `cooldown_until` DATETIME(3) NULL,
    ADD COLUMN `last_error_code` VARCHAR(64) NULL,
    ADD COLUMN `encryption_version` INTEGER NOT NULL DEFAULT 1;

CREATE INDEX `idx_ai_keys_availability`
    ON `ai_api_keys`(`provider`, `is_active`, `cooldown_until`);
