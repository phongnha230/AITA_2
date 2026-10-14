import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  CreateAssignmentSchema,
  UpdateAssignmentSchema,
  CreateTestCaseSchema,
  SetRubricRulesSchema,
  UpsertSolutionSchema,
  ControlSessionSchema,
} from '../../application/dtos/assignment.dto.js';
import {
  requireAssignmentManage,
  requireAssignmentView,
  requireCourseView,
  requireTestCaseManage,
} from '../middlewares/assignment-access.middleware.js';

const router = Router();

const assignmentController = container.assignmentController;

// Routes
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  validateBody(CreateAssignmentSchema),
  assignmentController.createAssignment
);

// Proctoring routes (must be placed before /:id)
router.get(
  '/proctoring/rooms',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  assignmentController.getProctoringRooms
);
router.get(
  '/:id/proctoring',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  assignmentController.getProctoringData
);
router.patch(
  '/:id/session-control',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  validateBody(ControlSessionSchema),
  assignmentController.controlSession
);

router.get('/:id', authenticateJWT, requireAssignmentView, assignmentController.getAssignmentDetail);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  validateBody(UpdateAssignmentSchema),
  assignmentController.updateAssignment
);
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  assignmentController.deleteAssignment
);
router.get('/course/:courseId', authenticateJWT, requireCourseView, assignmentController.getAssignmentsByCourse);


// Test Cases
router.post(
  '/:id/testcases',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  validateBody(CreateTestCaseSchema),
  assignmentController.addTestCase
);
router.get('/:id/testcases', authenticateJWT, requireAssignmentView, assignmentController.getTestCases);
router.put(
  '/testcases/:testCaseId',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireTestCaseManage,
  assignmentController.updateTestCase
);
router.delete(
  '/testcases/:testCaseId',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireTestCaseManage,
  assignmentController.deleteTestCase
);

// Rubrics
router.post(
  '/:id/rubrics',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  validateBody(SetRubricRulesSchema),
  assignmentController.setRubricRules
);
router.get('/:id/rubrics', authenticateJWT, requireAssignmentView, assignmentController.getRubricRules);

// Solutions (RAG)
router.post(
  '/:id/solutions',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  validateBody(UpsertSolutionSchema),
  assignmentController.upsertSolution
);
router.get(
  '/:id/solutions',
  authenticateJWT,
  authorizeRoles('LECTURER', 'ADMIN'),
  requireAssignmentManage,
  assignmentController.getSolutions
);

export default router;
