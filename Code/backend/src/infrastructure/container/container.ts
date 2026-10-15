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

// Infrastructure Services & Facades
import { BcryptHasherService } from '../../modules/auth/infrastructure/services/bcrypt-hasher.service.js';
import { JwtTokenService } from '../../modules/auth/infrastructure/services/jwt-token.service.js';
import { GoogleOAuthService } from '../../modules/auth/infrastructure/services/google-oauth.service.js';
import { ApiKeyRotatorFacade } from '../../modules/ai/infrastructure/facades/api-key-rotator.facade.js';
import { RagKnowledgeFacade } from '../../modules/ai/infrastructure/facades/rag-knowledge.facade.js';
import { zipExtractorService } from '../../modules/submission/infrastructure/storage/zip-extractor.service.js';
import { bullmqGradingDispatcher } from '../../modules/submission/infrastructure/queue/bullmq-grading-dispatcher.js';
import { SandboxService, defaultSandboxService } from '../../modules/sandbox/application/services/sandbox.service.js';

// Use Cases
import { LoginUseCase } from '../../modules/auth/application/use-cases/login.use-case.js';
import { RegisterUseCase } from '../../modules/auth/application/use-cases/register.use-case.js';
import { GoogleLoginUseCase } from '../../modules/auth/application/use-cases/google-login.use-case.js';
import { RefreshTokenUseCase } from '../../modules/auth/application/use-cases/refresh-token.use-case.js';
import { ChangePasswordUseCase } from '../../modules/auth/application/use-cases/change-password.use-case.js';

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

  // Services & Adapters
  public readonly passwordHasher = new BcryptHasherService();
  public readonly tokenService = new JwtTokenService();
  public readonly googleOAuthService = new GoogleOAuthService();
  public readonly apiKeyRotatorFacade = new ApiKeyRotatorFacade(this.aiApiKeyRepository);
  public readonly ragKnowledgeFacade = new RagKnowledgeFacade();
  public readonly artifactExtractor = zipExtractorService;
  public readonly gradingDispatcher = bullmqGradingDispatcher;
  public readonly sandboxService: SandboxService = defaultSandboxService;

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
  public readonly manageTestCasesUseCase = new ManageTestCasesUseCase(this.assignmentRepository);
  public readonly manageRubricsUseCase = new ManageRubricsUseCase(this.assignmentRepository);
  public readonly manageSolutionsUseCase = new ManageSolutionsUseCase(this.assignmentRepository);

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
  public readonly manageApiKeysUseCase = new ManageApiKeysUseCase(this.aiApiKeyRepository);
}

export const container = new ServiceContainer();
