-- ==============================================================================
-- DATABASE SCHEMA: AITA (AI-powered Teaching Assistant System)
-- DBMS: MySQL 8.0+
-- Tech Stack: Next.js (Frontend) + Express.js (Backend) + Redis (Queue)
-- Note: Includes all mandatory entities for SWD392 Evaluation 2
-- (GradingJob with priority, RubricRule, AiApiKey with rotation)
-- ==============================================================================

DROP DATABASE IF EXISTS aita_db;
CREATE DATABASE aita_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aita_db;

-- ------------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY, -- UUID v4
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'LECTURER', 'STUDENT') NOT NULL DEFAULT 'STUDENT',
    avatar_url VARCHAR(255) NULL,
    github_username VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. COURSES & TEAMS
-- ------------------------------------------------------------------------------
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL, -- e.g. 'SWD392', 'PRJ301'
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    lecturer_id VARCHAR(36) NOT NULL,
    semester VARCHAR(20) NOT NULL, -- e.g. 'Fall 2026'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_lecturer FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_courses_lecturer (lecturer_id),
    INDEX idx_courses_code (code)
) ENGINE=InnoDB;

CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    git_repo_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teams_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_teams_course (course_id)
) ENGINE=InnoDB;

CREATE TABLE course_enrollments (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    UNIQUE KEY uq_course_student (course_id, student_id),
    INDEX idx_enroll_student (student_id),
    INDEX idx_enroll_team (team_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. ASSIGNMENTS, RUBRIC RULES & TEST CASES
-- ------------------------------------------------------------------------------
CREATE TABLE assignments (
    id VARCHAR(36) PRIMARY KEY,
    course_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    allowed_languages VARCHAR(100) NOT NULL DEFAULT 'JAVA,PYTHON,CPP,CSHARP',
    deadline DATETIME NOT NULL,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    is_team_work BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_assignments_course (course_id),
    INDEX idx_assignments_deadline (deadline)
) ENGINE=InnoDB;

-- Rubric Rules (Tiêu chí chấm ngữ nghĩa AI)
CREATE TABLE rubric_rules (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g. 'Clean Architecture Compliance', 'Error Handling'
    description TEXT NULL,
    max_score DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    weight_percent DECIMAL(5,2) NOT NULL DEFAULT 20.00, -- % đóng góp vào điểm tổng
    prompt_instruction TEXT NOT NULL, -- Hướng dẫn cụ thể đưa vào AI Prompt
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rubrics_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    INDEX idx_rubrics_assignment (assignment_id)
) ENGINE=InnoDB;

-- Test Cases (Kiểm thử thực thi trong Sandbox & Ngữ cảnh cho RAG)
CREATE TABLE test_cases (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    question_no VARCHAR(10) NOT NULL DEFAULT 'Q1', -- 'Q1', 'Q2', 'Q3', 'Q4' (phục vụ phân loại bài thi PRO/CSD)
    output_file_name VARCHAR(50) NULL, -- vd: 'f1.txt' (nếu NULL thì so sánh qua stdout console; có giá trị thì so sánh File I/O CSD201)
    input_data LONGTEXT NOT NULL,
    expected_output LONGTEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    time_limit_ms INT NOT NULL DEFAULT 2000, -- default 2s
    memory_limit_mb INT NOT NULL DEFAULT 256, -- default 256MB
    score DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    rationale TEXT NULL, -- Ý đồ của Testcase phục vụ RAG (vd: "Kiểm tra danh sách rỗng", "Kiểm tra mảng 100k phần tử")
    test_type ENUM('BASIC', 'EDGE_CASE', 'PERFORMANCE', 'EXCEPTION') NOT NULL DEFAULT 'BASIC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_testcases_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    INDEX idx_testcases_assignment (assignment_id, question_no)
) ENGINE=InnoDB;

-- Kho Tri Thức Đáp Án Mẫu & Solution Notes phục vụ RAG (Lập chỉ mục vào Vector DB)
CREATE TABLE assignment_solutions (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    question_no VARCHAR(10) NOT NULL, -- e.g. 'Q1', 'Q2', 'Q3', 'Q4'
    solution_code LONGTEXT NOT NULL, -- Code giải chuẩn của Giảng viên
    explanation_notes LONGTEXT NOT NULL, -- Barem phân tích thuật toán & lưu ý bẫy code
    complexity_expected VARCHAR(50) NULL, -- e.g. 'O(n log n)', 'O(1)'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sol_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    INDEX idx_solutions_assignment (assignment_id, question_no)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. SUBMISSIONS & GRADING JOBS
-- ------------------------------------------------------------------------------
CREATE TABLE submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NULL,
    submission_type ENUM('ZIP_FILE', 'GIT_REPO') NOT NULL DEFAULT 'ZIP_FILE',
    file_url VARCHAR(255) NULL, -- Đường dẫn file .zip gốc lưu trữ
    staged_path VARCHAR(255) NULL, -- Đường dẫn thư mục mã nguồn đã giải nén & lọc sạch rác để mount Docker
    git_commit_hash VARCHAR(64) NULL,
    sandbox_score DECIMAL(5,2) NULL, -- Điểm testcase thực thi (max 7.00)
    ai_score DECIMAL(5,2) NULL, -- Điểm đánh giá ngữ nghĩa Rubric (max 3.00)
    total_score DECIMAL(5,2) NULL, -- Tổng điểm = sandbox_score + ai_score (thang 10)
    status ENUM('PENDING', 'PROCESSING', 'GRADED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_submissions_assignment (assignment_id),
    INDEX idx_submissions_student (student_id),
    INDEX idx_submissions_status (status)
) ENGINE=InnoDB;

-- Bắt buộc theo yêu cầu SWD392 Evaluation 2: Thực thể GradingJob có priority
CREATE TABLE grading_jobs (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    priority INT NOT NULL DEFAULT 2, -- 1: High (ưu tiên re-grade/chấm gấp), 2: Normal, 3: Low
    status ENUM('QUEUED', 'RUNNING_SANDBOX', 'RUNNING_AI', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    error_log LONGTEXT NULL,
    duration_ms INT NULL,
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    CONSTRAINT fk_jobs_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    INDEX idx_jobs_status_priority (status, priority ASC, queued_at ASC),
    INDEX idx_jobs_submission (submission_id)
) ENGINE=InnoDB;

CREATE TABLE submission_test_results (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    test_case_id VARCHAR(36) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    actual_output LONGTEXT NULL,
    execution_time_ms INT NULL,
    memory_used_kb INT NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_results_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_results_testcase FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    INDEX idx_results_submission (submission_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. AI API KEYS ROTATION & AI GRADING RESULTS
-- ------------------------------------------------------------------------------
-- Bắt buộc theo yêu cầu SWD392: AiApiKey hỗ trợ cơ chế Rotation chống rate limit
CREATE TABLE ai_api_keys (
    id VARCHAR(36) PRIMARY KEY,
    provider ENUM('OPENAI', 'GEMINI', 'CLAUDE') NOT NULL DEFAULT 'GEMINI',
    api_key_encrypted VARCHAR(500) NOT NULL, -- Mã hóa AES-256
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    request_count INT NOT NULL DEFAULT 0,
    rate_limit_per_min INT NOT NULL DEFAULT 60,
    last_used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_api_keys_active (is_active, provider, last_used_at ASC)
) ENGINE=InnoDB;

CREATE TABLE ai_grading_results (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    rubric_rule_id VARCHAR(36) NOT NULL,
    api_key_used_id VARCHAR(36) NULL,
    score_given DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    ai_feedback LONGTEXT NOT NULL,
    raw_response JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aigrading_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_aigrading_rubric FOREIGN KEY (rubric_rule_id) REFERENCES rubric_rules(id) ON DELETE CASCADE,
    CONSTRAINT fk_aigrading_key FOREIGN KEY (api_key_used_id) REFERENCES ai_api_keys(id) ON DELETE SET NULL,
    INDEX idx_aigrading_submission (submission_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. AI TUTOR CONVERSATIONS (Hỏi đáp thời gian thực 24/7)
-- ------------------------------------------------------------------------------
CREATE TABLE ai_tutor_conversations (
    id VARCHAR(36) PRIMARY KEY,
    submission_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aitutor_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_aitutor_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_aitutor_submission (submission_id)
) ENGINE=InnoDB;

CREATE TABLE ai_tutor_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    sender ENUM('STUDENT', 'AI') NOT NULL,
    message LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aitutor_conv FOREIGN KEY (conversation_id) REFERENCES ai_tutor_conversations(id) ON DELETE CASCADE,
    INDEX idx_aitutor_conv (conversation_id, created_at ASC)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 7. GIT ANALYTICS & ANTI-FREE-RIDING
-- ------------------------------------------------------------------------------
CREATE TABLE git_contributions (
    id VARCHAR(36) PRIMARY KEY,
    team_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    github_username VARCHAR(100) NOT NULL,
    commit_count INT NOT NULL DEFAULT 0,
    additions INT NOT NULL DEFAULT 0,
    deletions INT NOT NULL DEFAULT 0,
    last_commit_at DATETIME NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_git_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_git_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_team_student_git (team_id, student_id),
    INDEX idx_git_team (team_id)
) ENGINE=InnoDB;

-- ==============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA FOR TESTING)
-- ==============================================================================
INSERT INTO users (id, email, password_hash, full_name, role, github_username) VALUES
('u-admin-01', 'admin@fpt.edu.vn', '$2b$10$YourHashedPasswordHereAdmin', 'Quản Trị Viên AITA', 'ADMIN', 'aita-admin'),
('u-lect-01', 'giangvien@fpt.edu.vn', '$2b$10$YourHashedPasswordHereLecturer', 'TS. Nguyễn Văn A', 'LECTURER', 'nguyenvana-fpt'),
('u-stud-01', 'sinhvien1@fpt.edu.vn', '$2b$10$YourHashedPasswordHereStudent', 'Lê Văn Sinh', 'STUDENT', 'levansinh-fu'),
('u-stud-02', 'sinhvien2@fpt.edu.vn', '$2b$10$YourHashedPasswordHereStudent', 'Trần Thị Học', 'STUDENT', 'tranthihoc-fu');

INSERT INTO courses (id, code, name, description, lecturer_id, semester) VALUES
('c-swd392', 'SWD392', 'AI-Assisted System Design', 'Thiết kế hệ thống ứng dụng AI và Clean Architecture', 'u-lect-01', 'Fall 2026');

INSERT INTO ai_api_keys (id, provider, api_key_encrypted, is_active, rate_limit_per_min) VALUES
('k-gemini-01', 'GEMINI', 'ENC_MOCK_GEMINI_KEY_01', 1, 60),
('k-gemini-02', 'GEMINI', 'ENC_MOCK_GEMINI_KEY_02', 1, 60),
('k-openai-01', 'OPENAI', 'ENC_MOCK_OPENAI_KEY_01', 1, 30);
