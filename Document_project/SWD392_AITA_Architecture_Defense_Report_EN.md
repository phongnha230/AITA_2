# SYSTEM ARCHITECTURE DESIGN & DEFENSE SPECIFICATION REPORT
**CAPSTONE EVALUATION 2: ARCHITECTURE & SYSTEM MODELING DEFENSE**  
**PROJECT:** AITA – AI-POWERED TEACHING ASSISTANT SYSTEM  
*(Automated Practical Exam Grading Engine & Socratic Pedagogical Tutoring Platform)*

---

## ACADEMIC METADATA
- **Course:** SWD392 – Software Architecture and Design
- **Class:** SE19C-NJ | **Study Group:** GROUP 2
- **Semester:** Fall 2026 | **Institution:** FPT University – Quy Nhon AI Campus
- **Faculty Supervisors:** Huynh Vang (Mr. Vang) & MSc. Nguyen Van Vinh
- **Generated Word Document (.docx):** [`SWD392_AITA_Architecture_Defense_Report_EN.docx`](file:///c:/Users/HPPAVILION/Documents/IT/AITA/SWD392_AITA_Architecture_Defense_Report_EN.docx)

---

## ENGINEERING TEAM & ARCHITECTURAL ALLOCATION MATRIX

| No. | Full Name | Student ID | Architectural Ownership & Subsystem Responsibilities |
| :---: | :--- | :---: | :--- |
| **1** | **Tran Do Phong Nha (Leader)** | QE190161 | Overall Clean Architecture, 14-Entity Relational Schema (Prisma), Redis BullMQ Priority Orchestrator |
| **2** | **Le Van Bao** | QE180... (M2) | Academic Management Subsystem (Course, Assignment, RubricRule, Test Cases) |
| **3** | **Team Member 3** | QE180... (M3) | Artifact Submission Subsystem (ZIP Extraction, Staging Sanitization, Zip-Slip Prevention) |
| **4** | **Nguyen Van Diep** | QE180203 (M4) | Docker Sandbox Subsystem (ISandboxRunner Factory, Linux cgroups, 2s Hard Timeout, Diff) |
| **5** | **Nguyen The Dung** | QE180... (M5) | AI Assessment Subsystem (ChromaDB RAG Knowledge Store, LlmProviderAdapter, Socratic Chat) |
| **6** | **Doan De** | QE180... (M6) | Identity & Security Subsystem (JWT Auth, RBAC Middleware, Express API Gateway) |

---

## CHAPTER 1: PROBLEM CONTEXT & 3 CRITICAL TECHNICAL BOTTLENECKS

Practical Examinations (PE) at FPT University serve as the definitive benchmark for computer science competencies in fundamental programming subjects: PRF192 (Programming Fundamentals in C), PRO192 (Object-Oriented Programming in Java), and CSD201 (Data Structures and Algorithms). Current manual evaluation practices and naive monolithic assessment platforms face three fatal engineering bottlenecks:

### 1.1. Synchronous Submission Bottleneck (Peak Rush Concurrency)
- **Problem:** In the final 5–10 minutes of an exam, hundreds of students concurrently upload ZIP archives containing uncompiled source code. Synchronous processing (compilation, running test cases, and responding on the same HTTP thread) exhausts the Web Gateway thread pool, returning `HTTP 504 Gateway Timeout` and causing lost submissions.
- **AITA Solution:** An asynchronous event-driven architecture powered by **Redis Priority Queue (BullMQ)**. The API Gateway buffers files to staging, pushes a Job ID into Redis, and returns `HTTP 202 Accepted` within 50ms.

### 1.2. Malicious Host Interference & Host Freezing (Sandbox Security)
- **Problem:** Untrusted student code risks infinite loops (`while(1)`), fork bombs, memory leaks, or malicious OS commands like `system("rm -rf /")`.
- **AITA Solution:** Containerized **Docker Sandbox Isolation** enforced via Linux kernel `cgroups`: 256MB RAM quota (`--memory=256m --memory-swap=256m`), complete network air-gapping (`--network none`), unprivileged non-root user, and a **2000ms hard timeout** terminated via kernel `SIGKILL` signals.

### 1.3. Large Language Model Hallucinations & Subjective Variance
- **Problem:** Passing raw code directly to LLMs leads to hallucinations, invented errors, and failure to understand implicit FPT grading barems.
- **AITA Solution:** **Retrieval-Augmented Generation (RAG)** integrated with **ChromaDB**. Before invoking the LLM, the system retrieves lecturer reference code, failed testcase rationales, and exact rubric weighting to ground prompt generation.

---

## CHAPTER 2: SUBSYSTEM & OBJECT-ORIENTED ARCHITECTURE DESIGN (50% RUBRIC)

### 2.1. Clean Architecture Subsystem Decomposition (4 Decoupled Subsystems)

1. **Presentation Subsystem (Inbound Interface & Transport Layer):**
   - Express.js Routes, REST Controllers, Zod DTO Validation Schemas, JWT Authentication Guards, and Server-Sent Events (SSE) Stream Handlers.
   - Decoupled from business workflows and SQL queries.
2. **Application Subsystem (Use Case Orchestration Layer):**
   - Use Case Orchestrators: `GradingService`, `SubmissionService`, `AssignmentService`, and `RAGService`.
   - Implements UC07 (Submit PE Artifact), UC08 (Sanitize & Unzip), UC09 (Docker Sandbox Coordination), UC10 (AI Semantic Evaluation).
3. **Domain Subsystem (Enterprise Core & Business Rules Layer):**
   - 14 Core Domain Entities, Domain Enums (`JobStatus`, `SubmissionStatus`), and Abstract Architectural Contracts (`ISandboxRunner`, `ILlmProvider`, `IRepository`).
   - Zero framework dependencies (pure TypeScript), independent of external libraries.
4. **Infrastructure Subsystem (Technical Implementation & Adapters Layer):**
   - MySQL 8.0 Persistence with Prisma ORM, Distributed Priority Queue (Redis + BullMQ), Docker Sandbox Process Isolation Runner, ChromaDB Vector Knowledge Store, and External LLM SDK Adapters (Google Gemini, OpenAI).

### 2.2. Static Domain Model: 14 Entities across 4 Cohesive Packages

![Domain Class Diagram](plantuml/class_diagram_static_model.png)

- **Package 1: IAM & Academic Management:** `User`, `Course`, `CourseEnrollment` (RBAC: ADMIN, LECTURER, STUDENT).
- **Package 2: Exam Specs & RAG Knowledge:** `Assignment`, `TestCase`, `RubricRule`, `AssignmentSolution` (Stores reference vector embeddings).
- **Package 3: Submission & Execution Engine:** `Submission`, `GradingJob`, `SubmissionTestResult` (State machine tracking).
- **Package 4: Security Audit & System:** `AiApiKey`, `SystemAuditLog` (Multi-tenant API key rotation pool).

### 2.3. Enterprise Implementation of 5 Core Gang of Four (GoF) Design Patterns

1. **Factory Method Pattern (`SandboxRunnerFactory`):**
   - Factory instantiates appropriate `ISandboxRunner` (`CDockerRunner` for PRF192 `gcc -O2` stdio piping vs `JavaDockerRunner` for PRO192/CSD201 `javac 21` package file I/O).
   - Diagram: `dp_factory_method.png`
2. **Adapter Pattern (`LlmProviderAdapter`):**
   - Standardizes AI interactions via `ILlmProvider.generateReview(prompt)`, shielding application from vendor-specific changes (Gemini vs OpenAI vs Claude).
   - Diagram: `dp_adapter_pattern.png`
3. **Strategy Pattern (`GradingStrategy`):**
   - Runtime selection between `AutomatedTestCaseStrategy` (I/O only), `AiSemanticReviewStrategy` (Clean code analysis), and `HybridGradingStrategy` (70% I/O + 30% AI).
   - Diagram: `dp_strategy_pattern.png`
4. **Facade Pattern (`RagKnowledgeFacade` & `ApiKeyRotatorFacade`):**
   - Simplifies complex RAG embedding queries and implements Round-Robin rotation across API keys to prevent `HTTP 429 Too Many Requests`.
   - Diagram: `dp_facade_pattern.png`
5. **Observer Pattern (`JobStatusObserver`):**
   - Asynchronous worker events trigger real-time Server-Sent Events (SSE) updates to the web client, eliminating polling overhead.
   - Diagram: `dp_observer_pattern.png`

---

## CHAPTER 3: CLIENT/SERVER & DISTRIBUTED ARCHITECTURE DESIGN (30% RUBRIC)

### 3.1. Distributed Client/Server & Deployment Architecture

![Distributed Architecture and Deployment View](plantuml/distributed_architecture_deployment_view.png)

- **Client Tier (Next.js 14 App Router, Port 3000):** Student, Lecturer, and Admin portals; SSE real-time listener.
- **API Gateway Tier (Express.js / Node.js 22 LTS, Port 5000):** Stateless JWT validation, Zod DTO sanitization, fast HTTP 202 job enqueuing (< 50ms).
- **Distributed Message Broker (Redis 7.2 Alpine + BullMQ, Port 6379):** Priority scheduling (`Priority = 1` for Official Exams vs `Priority = 5` for Practice), Dead Letter Queue (DLQ), and automated 3x retry with exponential backoff.
- **Background Execution Engine & Sandbox (Daemon Workers + Docker, cgroups):** Autonomous BullMQ consumers, Linux cgroups (256MB RAM limit, 2s Hard Timeout, `--network none`), CRLF/LF line trimming comparator.
- **Persistence & AI Tier:** MySQL 8.0 (Port 3306) via Prisma ORM; ChromaDB (Port 8000) for RAG vector search.

### 3.2. Dynamic Workflow Modeling: Sequence, State, and Activity Diagrams

#### High-Level Dynamic Sequence Diagram (UC07 – UC10)
![Dynamic Sequence Diagram](plantuml/sequence_diagram_dynamic_model.png)

#### State Machine Diagram: GradingJob Lifecycle
![State Machine Diagram](plantuml/state_diagram_dynamic_model.png)

#### End-to-End Activity Workflow Diagram (5 Swimlanes)
![Activity Diagram](plantuml/activity_diagram_pe_grading.png)

---

## CHAPTER 4: DEVELOPMENT PROCESS & AI-ASSISTED ENGINEERING (20% RUBRIC)

### 4.1. Audit Evidence: 6 Representative AI Usage Log Entries

| Log ID & Date | Member & AI Tool | Architectural Objective | Prompt Text & Deliverable Artifact |
| :---: | :--- | :--- | :--- |
| **Entry #21**<br>(2026-09-22) | Tran Do Phong Nha<br>Antigravity AI | Systematize 5 Design Patterns under Clean Architecture | **Prompt:** "Create a comprehensive guide on design patterns used in AITA..."<br>**Deliverable:** Published `5_Design_Patterns.md` & PlantUML diagrams for Factory, Adapter, Strategy, Facade, Observer. |
| **Entry #23**<br>(2026-09-24) | Nguyen Van Diep<br>Antigravity AI | Design `ISandboxRunner` Interface & Factory Method | **Prompt:** "Guide me to implement backend member 4 sandbox runner..."<br>**Deliverable:** Technical contracts for `ISandboxRunner`, `SandboxRunnerFactory`, and `CDockerRunner`. |
| **Entry #24**<br>(2026-09-24) | Nguyen Van Diep<br>Antigravity AI | Harden C Docker Runner (cgroups, 2s Timeout) | **Prompt:** "Write secure C Runner in Docker for PRF192 with resource limits..."<br>**Deliverable:** Implemented `c-docker.runner.ts` with `gcc -O2`, 256MB RAM, `--network none`, and `while(1)` SIGKILL. |
| **Entry #27**<br>(2026-09-25) | Nguyen Van Diep<br>Antigravity AI | CRLF vs LF Line-Ending Normalization Algorithm | **Prompt:** "Implement output comparator between student output and model solution handling Windows vs Linux newlines"<br>**Deliverable:** `OutputComparator.compare()` with `\r\n` to `\n` normalization, line trimming, and visual diff highlighting. |
| **Entry #16**<br>(2026-09-19) | Tran Do Phong Nha<br>Antigravity AI | Prisma Foreign Key Integrity Audit (11 Tables) | **Prompt:** "Audit my DB schema for missing foreign keys and ensure RAG alignment..."<br>**Deliverable:** Audited 11 tables, added `assignment_solutions` RAG table, validated Prisma DDL with zero errors. |
| **Entry #19**<br>(2026-09-19) | Tran Do Phong Nha<br>Antigravity AI | RBAC Route Group Isolation (Zero-Bleeding) | **Prompt:** "Enforce strict route group isolation per role so student/lecturer/admin portals never leak..."<br>**Deliverable:** Next.js `(student)`, `(lecturer)`, `(admin)` route groups guarded by JWT `middleware.ts`. |

### 4.2. Team Collaboration Governance & Git Flow Architecture
- **Folder Ownership:** Each member owns a modular backend folder in `src/modules/`.
- **Git Flow:** Feature branches `feature/[MemberName]/[ModuleName]` with required peer review before merging into `main`.
- **Automated Gates:** Automated compilation and linting tests in CI.

---

## CHAPTER 5: ACADEMIC DEFENSE PRESENTATION SCRIPT (10–12 MINUTES)

- **Minutes 0–2 (Introduction):** Lead introduces team, project scope, and 3 core bottlenecks.
- **Minutes 2–6 (50% Rubric):** Deep dive into 4 Clean Architecture layers, 14 domain entities, and 5 GoF design patterns.
- **Minutes 6–9 (30% Rubric):** Explain distributed asynchronous engine, Redis BullMQ priority scheduling, Docker Sandbox with cgroups limits (256MB RAM, 2s Hard Timeout, `--network none`), and real-time SSE progress streaming.
- **Minutes 9–11 (20% Rubric):** Present transparent AI usage logs (over 30 entries, 6 key architectural entries highlighted), folder ownership model, and Git contribution equality.
- **Minutes 11–12 (Closing):** Concluding remarks and invitation for examination board questions.

---

## CHAPTER 6: ACADEMIC DEFENSE Q&A MASTER BANK (TOP 10 QUESTIONS)

1. **Why Clean Architecture over 3-Tier MVC?** Decouples core grading logic from external drivers (Docker, ChromaDB, LLM APIs) via Inversion of Control (IoC).
2. **Handling 500 concurrent submissions in the final 5 minutes?** Stateless API Gateway pushes jobs to Redis in <50ms (HTTP 202 Accepted); background workers consume jobs sequentially by priority without blocking web threads.
3. **Preventing malicious code (`system("rm -rf /")`, `while(1)`)?** Linux cgroups 256MB RAM limit, 2000ms SIGKILL hard timeout, `--network none` air-gapping, and non-root execution.
4. **Why Server-Sent Events (SSE) instead of WebSockets or Polling?** Lightweight HTTP standard, zero-polling overhead, native reconnection, ideal for unidirectional progress updates.
5. **How RAG prevents LLM Hallucinations?** Augments prompts with verified lecturer solutions and testcase rationales from ChromaDB.
6. **Mitigating LLM API Rate Limits (HTTP 429)?** Multi-tenant API key pool managed via `ApiKeyRotatorFacade` with Round-Robin failover.
7. **Maintaining academic integrity with AI?** AI acted strictly as an Architectural Advisor; all generated artifacts were validated and logged in `AI_PROMPT_LOG.md`.
8. **Demonstrating balanced team contribution?** Folder ownership per member, dedicated feature branches, balanced commit history and task allocation matrix.
9. **CRLF vs LF line ending handling?** `OutputComparator` normalizes `\r\n` to `\n` and trims trailing whitespace per line before diff matching.
10. **Compilation errors vs runtime exceptions?** Two-stage pipeline: compiler exits with non-zero code halts immediately with `COMPILE_ERROR` (0 points), skipping test execution.
