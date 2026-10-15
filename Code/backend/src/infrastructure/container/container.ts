import prisma from '../database/prisma.client.js';

// Repositories
import { PrismaUserRepository } from '../../modules/user/infrastructure/repositories/prisma-user.repository.js';
import { PrismaDashboardRepository } from '../../modules/user/infrastructure/repositories/prisma-dashboard.repository.js';
import { PrismaCourseRepository } from '../../modules/course/infrastructure/repositories/prisma-course.repository.js';
import { PrismaAssignmentRepository } from '../../modules/assignment/infrastructure/repositories/prisma-assignment.repository.js';
import { PrismaSubmissionRepository } from '../../modules/submission/infrastructure/repositories/prisma-submission.repository.js';
import { PrismaTeamRepository } from '../../modules/team/infrastructure/repositories/prisma-team.repository.js';
import { PrismaAiGradingRepository } from '../../modules/ai/infrastructure/repositories/prisma-ai-grading.repository.js';
import { PrismaAiApiKeyRepository } from '../../modules/ai/infrastructure/repositories/prisma-ai-api-key.repository.js';
import { PrismaAiTutorRepository } from '../../modules/ai/infrastructure/repositories/prisma-ai-tutor.repository.js';
import { PrismaRagContextRepository } from '../../modules/ai/infrastructure/repositories/prisma-rag-context.repository.js';

// Infrastructure Services & Facades
import { BcryptHasherService } from '../../modules/auth/infrastructure/services/bcrypt-hasher.service.js';
import { JwtTokenService } from '../../modules/auth/infrastructure/services/jwt-token.service.js';
import { GoogleOAuthService } from '../../modules/auth/infrastructure/services/google-oauth.service.js';
import { ApiKeyRotatorFacade } from '../../modules/ai/infrastructure/facades/api-key-rotator.facade.js';
import { RagKnowledgeFacade } from '../../modules/ai/infrastructure/facades/rag-knowledge.facade.js';
import { ChromaVectorService } from '../../modules/ai/infrastructure/vector/chroma-vector.service.js';
import { zipExtractorService } from '../../modules/submission/infrastructure/storage/zip-extractor.service.js';
import { bullmqGradingDispatcher } from '../../modules/submission/infrastructure/queue/bullmq-grading-dispatcher.js';
import { SandboxService } from '../../modules/sandbox/application/services/sandbox.service.js';
import { PrismaSandboxRepository } from '../../modules/sandbox/infrastructure/repositories/prisma-sandbox.repository.js';
import { SandboxController } from '../../modules/sandbox/presentation/controllers/sandbox.controller.js';

// Use Cases
import { LoginUseCase } from '../../modules/auth/application/use-cases/login.use-case.js';
import { RegisterUseCase } from '../../modules/auth/application/use-cases/register.use-case.js';
import { GoogleLoginUseCase } from '../../modules/auth/application/use-cases/google-login.use-case.js';
import { RefreshTokenUseCase } from '../../modules/auth/application/use-cases/refresh-token.use-case.js';
import { ChangePasswordUseCase } from '../../modules/auth/application/use-cases/change-password.use-case.js';
import { LogoutUseCase } from '../../modules/auth/application/use-cases/logout.use-case.js';

import { GetProfileUseCase } from '../../modules/user/application/use-cases/get-profile.use-case.js';
import { UpdateProfileUseCase } from '../../modules/user/application/use-cases/update-profile.use-case.js';
import { GetUsersUseCase } from '../../modules/user/application/use-cases/get-users.use-case.js';
import { GetUserByIdUseCase } from '../../modules/user/application/use-cases/get-user-by-id.use-case.js';
import { AdminCreateUserUseCase } from '../../modules/user/application/use-cases/admin-create-user.use-case.js';
import { AdminCreateBatchUsersUseCase } from '../../modules/user/application/use-cases/admin-create-batch-users.use-case.js';
import { AdminUpdateUserUseCase } from '../../modules/user/application/use-cases/admin-update-user.use-case.js';
import { AdminResetPasswordUseCase } from '../../modules/user/application/use-cases/admin-reset-password.use-case.js';
import { GetAdminDashboardUseCase } from '../../modules/user/application/use-cases/get-admin-dashboard.use-case.js';
import { GetLecturerDashboardUseCase } from '../../modules/user/application/use-cases/get-lecturer-dashboard.use-case.js';
import { GetStudentPortfolioUseCase } from '../../modules/user/application/use-cases/get-student-portfolio.use-case.js';

import { CreateAssignmentUseCase } from '../../modules/assignment/application/use-cases/create-assignment.use-case.js';
import { GetAssignmentDetailUseCase } from '../../modules/assignment/application/use-cases/get-assignment-detail.use-case.js';
import { GetAssignmentsByCourseUseCase } from '../../modules/assignment/application/use-cases/get-assignments-by-course.use-case.js';
import { UpdateAssignmentUseCase } from '../../modules/assignment/application/use-cases/update-assignment.use-case.js';
import { ManageTestCasesUseCase } from '../../modules/assignment/application/use-cases/manage-testcases.use-case.js';
import { ManageRubricsUseCase } from '../../modules/assignment/application/use-cases/manage-rubrics.use-case.js';
import { ManageSolutionsUseCase } from '../../modules/assignment/application/use-cases/manage-solutions.use-case.js';
import { GetProctoringDataUseCase } from '../../modules/assignment/application/use-cases/get-proctoring-data.use-case.js';
import { ControlSessionUseCase } from '../../modules/assignment/application/use-cases/control-session.use-case.js';
import { DeleteAssignmentUseCase } from '../../modules/assignment/application/use-cases/delete-assignment.use-case.js';

import { CreateCourseUseCase } from '../../modules/course/application/use-cases/create-course.use-case.js';
import { GetCoursesUseCase } from '../../modules/course/application/use-cases/get-courses.use-case.js';
import { GetCourseByIdUseCase } from '../../modules/course/application/use-cases/get-course-by-id.use-case.js';
import { UpdateCourseUseCase } from '../../modules/course/application/use-cases/update-course.use-case.js';
import { DeleteCourseUseCase } from '../../modules/course/application/use-cases/delete-course.use-case.js';
import { EnrollStudentsUseCase } from '../../modules/course/application/use-cases/enroll-students.use-case.js';
import { RemoveStudentUseCase } from '../../modules/course/application/use-cases/remove-student.use-case.js';
import { GenerateJoinCodeUseCase } from '../../modules/course/application/use-cases/generate-join-code.use-case.js';
import { RevokeJoinCodeUseCase } from '../../modules/course/application/use-cases/revoke-join-code.use-case.js';
import { JoinCourseByCodeUseCase } from '../../modules/course/application/use-cases/join-course-by-code.use-case.js';

import { SubmitAssignmentUseCase } from '../../modules/submission/application/use-cases/submit-assignment.use-case.js';
import { GetSubmissionStatusUseCase } from '../../modules/submission/application/use-cases/get-submission-status.use-case.js';
import { GetAssignmentSubmissionsUseCase } from '../../modules/submission/application/use-cases/get-assignment-submissions.use-case.js';
import { GetAllSubmissionsUseCase } from '../../modules/submission/application/use-cases/get-all-submissions.use-case.js';

import { CreateTeamUseCase } from '../../modules/team/application/use-cases/create-team.use-case.js';
import { ManageTeamUseCase } from '../../modules/team/application/use-cases/manage-team.use-case.js';

import { GradeSubmissionAiUseCase } from '../../modules/ai/application/use-cases/grade-submission-ai.use-case.js';
import { StartTutorConversationUseCase } from '../../modules/ai/application/use-cases/start-tutor-conversation.use-case.js';
import { SendTutorMessageUseCase } from '../../modules/ai/application/use-cases/send-tutor-message.use-case.js';
import { GetTutorConversationUseCase } from '../../modules/ai/application/use-cases/get-tutor-conversation.use-case.js';
import { ManageApiKeysUseCase } from '../../modules/ai/application/use-cases/manage-api-keys.use-case.js';
import { AuthController } from '../../modules/auth/presentation/controllers/auth.controller.js';
import { UserController } from '../../modules/user/presentation/controllers/user.controller.js';
import { CourseController } from '../../modules/course/presentation/controllers/course.controller.js';
import { AssignmentController } from '../../modules/assignment/presentation/controllers/assignment.controller.js';
import { SubmissionController } from '../../modules/submission/presentation/controllers/submission.controller.js';
import { TeamController } from '../../modules/team/presentation/controllers/team.controller.js';
import { AiGradingController } from '../../modules/ai/presentation/controllers/ai-grading.controller.js';
import { AiTutorController } from '../../modules/ai/presentation/controllers/ai-tutor.controller.js';
import { AiApiKeyController } from '../../modules/ai/presentation/controllers/ai-api-key.controller.js';
import { JobAdminService } from '../queue/job-admin.service.js';
import { JobController } from '../../presentation/controllers/job.controller.js';
import { HealthService } from '../health/health.service.js';
import { HealthController } from '../../presentation/controllers/health.controller.js';
import { redisConnection } from '../redis/redis.client.js';
import { BullMqRagIndexingQueue } from '../../modules/ai/infrastructure/queue/rag-indexing.queue.js';
import { ApiKeyCipherService } from '../../modules/ai/infrastructure/security/api-key-cipher.service.js';
import { RedisRpmLimiter } from '../../modules/ai/infrastructure/credentials/redis-rpm-limiter.js';
import { GeminiCredentialPoolService } from '../../modules/ai/infrastructure/credentials/gemini-credential-pool.service.js';
import { GeminiEmbeddingProvider } from '../../modules/ai/infrastructure/embedding/gemini-embedding.provider.js';

class ServiceContainer {
  // Repositories
  public readonly userRepository = new PrismaUserRepository(prisma);
  public readonly dashboardRepository = new PrismaDashboardRepository(prisma);
  public readonly courseRepository = new PrismaCourseRepository(prisma);
  public readonly assignmentRepository = new PrismaAssignmentRepository(prisma);
  public readonly submissionRepository = new PrismaSubmissionRepository(prisma);
  public readonly teamRepository = new PrismaTeamRepository(prisma);
  public readonly aiGradingRepository = new PrismaAiGradingRepository(prisma);
  public readonly aiApiKeyRepository = new PrismaAiApiKeyRepository(prisma);
  public readonly aiTutorRepository = new PrismaAiTutorRepository(prisma);
  public readonly ragContextRepository = new PrismaRagContextRepository(prisma);
  public readonly sandboxRepository = new PrismaSandboxRepository(prisma);
  public readonly jobAdminService = new JobAdminService(prisma);
  public readonly healthService = new HealthService(prisma, redisConnection);
  public readonly ragIndexingQueue = new BullMqRagIndexingQueue();

  // Services & Adapters
  public readonly passwordHasher = new BcryptHasherService();
  public readonly tokenService = new JwtTokenService();
  public readonly googleOAuthService = new GoogleOAuthService();
  public readonly apiKeyCipher = new ApiKeyCipherService();
  public readonly aiRpmLimiter = new RedisRpmLimiter(redisConnection);
  public readonly geminiCredentialPool = new GeminiCredentialPoolService(
    this.aiApiKeyRepository,
    this.aiRpmLimiter,
    this.apiKeyCipher
  );
  public readonly apiKeyRotatorFacade = new ApiKeyRotatorFacade(this.geminiCredentialPool);
  public readonly embeddingProvider = new GeminiEmbeddingProvider(this.geminiCredentialPool);
  public readonly solutionVectorStore = new ChromaVectorService(this.embeddingProvider);
  public readonly ragKnowledgeFacade = new RagKnowledgeFacade(
    this.ragContextRepository,
    this.solutionVectorStore
  );
  public readonly artifactExtractor = zipExtractorService;
  public readonly gradingDispatcher = bullmqGradingDispatcher;
  public readonly sandboxService = new SandboxService(this.sandboxRepository, this.artifactExtractor);

  // Use Cases - Auth
  public readonly loginUseCase = new LoginUseCase(
    this.userRepository,
    this.passwordHasher,
    this.tokenService
  );
  public readonly registerUseCase = new RegisterUseCase(
    this.userRepository,
    this.passwordHasher,
    this.tokenService
  );
  public readonly googleLoginUseCase = new GoogleLoginUseCase(
    this.userRepository,
    this.googleOAuthService,
    this.tokenService
  );
  public readonly refreshTokenUseCase = new RefreshTokenUseCase(
    this.userRepository,
    this.tokenService
  );
  public readonly changePasswordUseCase = new ChangePasswordUseCase(
    this.userRepository,
    this.passwordHasher
  );
  public readonly logoutUseCase = new LogoutUseCase(this.userRepository, this.tokenService);

  // Use Cases - User
  public readonly getProfileUseCase = new GetProfileUseCase(this.userRepository);
  public readonly updateProfileUseCase = new UpdateProfileUseCase(this.userRepository);
  public readonly getUsersUseCase = new GetUsersUseCase(this.userRepository);
  public readonly getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
  public readonly adminCreateUserUseCase = new AdminCreateUserUseCase(
    this.userRepository,
    this.passwordHasher
  );
  public readonly adminCreateBatchUsersUseCase = new AdminCreateBatchUsersUseCase(
    this.userRepository,
    this.passwordHasher
  );
  public readonly adminUpdateUserUseCase = new AdminUpdateUserUseCase(this.userRepository);
  public readonly adminResetPasswordUseCase = new AdminResetPasswordUseCase(
    this.userRepository,
    this.passwordHasher
  );
  public readonly getAdminDashboardUseCase = new GetAdminDashboardUseCase(this.dashboardRepository);
  public readonly getLecturerDashboardUseCase = new GetLecturerDashboardUseCase(this.dashboardRepository);
  public readonly getStudentPortfolioUseCase = new GetStudentPortfolioUseCase(this.dashboardRepository);

  // Use Cases - Assignment
  public readonly createAssignmentUseCase = new CreateAssignmentUseCase(
    this.assignmentRepository,
    this.courseRepository,
    this.userRepository
  );
  public readonly getAssignmentDetailUseCase = new GetAssignmentDetailUseCase(this.assignmentRepository);
  public readonly getAssignmentsByCourseUseCase = new GetAssignmentsByCourseUseCase(this.assignmentRepository);
  public readonly updateAssignmentUseCase = new UpdateAssignmentUseCase(this.assignmentRepository);
  public readonly deleteAssignmentUseCase = new DeleteAssignmentUseCase(
    this.assignmentRepository,
    this.solutionVectorStore
  );
  public readonly manageTestCasesUseCase = new ManageTestCasesUseCase(this.assignmentRepository);
  public readonly manageRubricsUseCase = new ManageRubricsUseCase(this.assignmentRepository);
  public readonly manageSolutionsUseCase = new ManageSolutionsUseCase(
    this.assignmentRepository,
    this.ragIndexingQueue
  );
  public readonly getProctoringDataUseCase = new GetProctoringDataUseCase(this.assignmentRepository);
  public readonly controlSessionUseCase = new ControlSessionUseCase(this.assignmentRepository);

  // Use Cases - Course
  public readonly createCourseUseCase = new CreateCourseUseCase(this.courseRepository, this.userRepository);
  public readonly getCoursesUseCase = new GetCoursesUseCase(this.courseRepository);
  public readonly getCourseByIdUseCase = new GetCourseByIdUseCase(this.courseRepository);
  public readonly updateCourseUseCase = new UpdateCourseUseCase(this.courseRepository);
  public readonly deleteCourseUseCase = new DeleteCourseUseCase(this.courseRepository);
  public readonly enrollStudentsUseCase = new EnrollStudentsUseCase(this.courseRepository);
  public readonly removeStudentUseCase = new RemoveStudentUseCase(this.courseRepository);
  public readonly generateJoinCodeUseCase = new GenerateJoinCodeUseCase(this.courseRepository);
  public readonly revokeJoinCodeUseCase = new RevokeJoinCodeUseCase(this.courseRepository);
  public readonly joinCourseByCodeUseCase = new JoinCourseByCodeUseCase(this.courseRepository);

  // Use Cases - Submission
  public readonly submitAssignmentUseCase = new SubmitAssignmentUseCase({
    submissionRepository: this.submissionRepository,
    assignmentRepository: this.assignmentRepository,
    courseRepository: this.courseRepository,
    artifactExtractor: this.artifactExtractor,
    gradingDispatcher: this.gradingDispatcher,
  });
  public readonly getSubmissionStatusUseCase = new GetSubmissionStatusUseCase(this.submissionRepository);
  public readonly getAssignmentSubmissionsUseCase = new GetAssignmentSubmissionsUseCase(this.submissionRepository);
  public readonly getAllSubmissionsUseCase = new GetAllSubmissionsUseCase(this.submissionRepository);

  // Use Cases - Team
  public readonly createTeamUseCase = new CreateTeamUseCase(this.teamRepository);
  public readonly manageTeamUseCase = new ManageTeamUseCase(
    this.teamRepository,
    this.userRepository,
    this.courseRepository
  );

  // Use Cases - AI
  public readonly gradeSubmissionAiUseCase = new GradeSubmissionAiUseCase(
    this.aiGradingRepository,
    this.submissionRepository,
    this.apiKeyRotatorFacade,
    this.ragKnowledgeFacade
  );
  public readonly startTutorConversationUseCase = new StartTutorConversationUseCase(
    this.aiTutorRepository,
    this.submissionRepository
  );
  public readonly sendTutorMessageUseCase = new SendTutorMessageUseCase(
    this.aiTutorRepository,
    this.submissionRepository,
    this.apiKeyRotatorFacade
  );
  public readonly getTutorConversationUseCase = new GetTutorConversationUseCase(this.aiTutorRepository);
  public readonly manageApiKeysUseCase = new ManageApiKeysUseCase(
    this.aiApiKeyRepository,
    this.apiKeyCipher
  );

  // Controllers - constructed only in this composition root
  public readonly authController = new AuthController(
    this.loginUseCase,
    this.registerUseCase,
    this.googleLoginUseCase,
    this.changePasswordUseCase,
    this.refreshTokenUseCase,
    this.logoutUseCase
  );
  public readonly userController = new UserController(
    this.getProfileUseCase,
    this.getStudentPortfolioUseCase,
    this.getLecturerDashboardUseCase,
    this.updateProfileUseCase,
    this.getUsersUseCase,
    this.getUserByIdUseCase,
    this.adminCreateUserUseCase,
    this.adminCreateBatchUsersUseCase,
    this.adminUpdateUserUseCase,
    this.adminResetPasswordUseCase,
    this.getAdminDashboardUseCase
  );
  public readonly courseController = new CourseController(
    this.createCourseUseCase,
    this.getCoursesUseCase,
    this.getCourseByIdUseCase,
    this.updateCourseUseCase,
    this.deleteCourseUseCase,
    this.enrollStudentsUseCase,
    this.removeStudentUseCase,
    this.generateJoinCodeUseCase,
    this.revokeJoinCodeUseCase,
    this.joinCourseByCodeUseCase
  );
  public readonly assignmentController = new AssignmentController(
    this.createAssignmentUseCase,
    this.getAssignmentDetailUseCase,
    this.getAssignmentsByCourseUseCase,
    this.updateAssignmentUseCase,
    this.deleteAssignmentUseCase,
    this.manageTestCasesUseCase,
    this.manageRubricsUseCase,
    this.manageSolutionsUseCase,
    this.getProctoringDataUseCase,
    this.controlSessionUseCase
  );
  public readonly submissionController = new SubmissionController(
    this.submitAssignmentUseCase,
    this.getSubmissionStatusUseCase,
    this.getAssignmentSubmissionsUseCase,
    this.getAllSubmissionsUseCase
  );
  public readonly teamController = new TeamController(this.createTeamUseCase, this.manageTeamUseCase);
  public readonly aiGradingController = new AiGradingController(this.gradeSubmissionAiUseCase);
  public readonly aiTutorController = new AiTutorController(
    this.startTutorConversationUseCase,
    this.sendTutorMessageUseCase,
    this.getTutorConversationUseCase
  );
  public readonly aiApiKeyController = new AiApiKeyController(this.manageApiKeysUseCase);
  public readonly sandboxController = new SandboxController(this.sandboxService, this.sandboxRepository);
  public readonly jobController = new JobController(this.jobAdminService);
  public readonly healthController = new HealthController(this.healthService);
}

export const container = new ServiceContainer();
