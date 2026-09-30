import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller.js';
import { CreateAssignmentUseCase } from '../../application/use-cases/create-assignment.use-case.js';
import { GetAssignmentDetailUseCase } from '../../application/use-cases/get-assignment-detail.use-case.js';
import { GetAssignmentsByCourseUseCase } from '../../application/use-cases/get-assignments-by-course.use-case.js';
import { UpdateAssignmentUseCase } from '../../application/use-cases/update-assignment.use-case.js';
import { ManageTestCasesUseCase } from '../../application/use-cases/manage-testcases.use-case.js';
import { ManageRubricsUseCase } from '../../application/use-cases/manage-rubrics.use-case.js';
import { ManageSolutionsUseCase } from '../../application/use-cases/manage-solutions.use-case.js';
import { PrismaAssignmentRepository } from '../../infrastructure/repositories/prisma-assignment.repository.js';
import { PrismaCourseRepository } from '../../../course/infrastructure/repositories/prisma-course.repository.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
  CreateTestCaseSchema,
  SetRubricRulesSchema,
  UpsertSolutionSchema,
} from '../../application/dtos/assignment.dto.js';

const router = Router();

// Composition Root for Assignment
const assignmentRepository = new PrismaAssignmentRepository(prisma);
const courseRepository = new PrismaCourseRepository(prisma);

const createAssignmentUseCase = new CreateAssignmentUseCase(assignmentRepository, courseRepository);
const getAssignmentDetailUseCase = new GetAssignmentDetailUseCase(assignmentRepository);
const getAssignmentsByCourseUseCase = new GetAssignmentsByCourseUseCase(assignmentRepository);
const updateAssignmentUseCase = new UpdateAssignmentUseCase(assignmentRepository);
const manageTestCasesUseCase = new ManageTestCasesUseCase(assignmentRepository);
const manageRubricsUseCase = new ManageRubricsUseCase(assignmentRepository);
const manageSolutionsUseCase = new ManageSolutionsUseCase(assignmentRepository);

const assignmentController = new AssignmentController(
  createAssignmentUseCase,
  getAssignmentDetailUseCase,
  getAssignmentsByCourseUseCase,
  updateAssignmentUseCase,
  manageTestCasesUseCase,
  manageRubricsUseCase,
  manageSolutionsUseCase
);

// Routes
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(CreateAssignmentSchema),
  assignmentController.createAssignment
);
router.get('/:id', authenticateJWT, assignmentController.getAssignmentDetail);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(UpdateAssignmentSchema),
  assignmentController.updateAssignment
);
router.get('/course/:courseId', authenticateJWT, assignmentController.getAssignmentsByCourse);

// Test Cases
router.post(
  '/:id/testcases',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(CreateTestCaseSchema),
  assignmentController.addTestCase
);
router.get('/:id/testcases', authenticateJWT, assignmentController.getTestCases);
router.put(
  '/testcases/:testCaseId',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  assignmentController.updateTestCase
);
router.delete(
  '/testcases/:testCaseId',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  assignmentController.deleteTestCase
);

// Rubrics
router.post(
  '/:id/rubrics',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(SetRubricRulesSchema),
  assignmentController.setRubricRules
);
router.get('/:id/rubrics', authenticateJWT, assignmentController.getRubricRules);

// Solutions (RAG)
router.post(
  '/:id/solutions',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(UpsertSolutionSchema),
  assignmentController.upsertSolution
);
router.get(
  '/:id/solutions',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  assignmentController.getSolutions
);

export default router;
