import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller.js';

const router = Router();

// CRUD Đề thi PE
router.post('/', (req, res, next) => assignmentController.createAssignment(req, res, next));
router.get('/:id', (req, res, next) => assignmentController.getAssignmentDetail(req, res, next));
router.put('/:id', (req, res, next) => assignmentController.updateAssignment(req, res, next));
router.get('/course/:courseId', (req, res, next) => assignmentController.listAssignmentsByCourse(req, res, next));

// Quản lý Bộ Test Cases (kèm rationale, outputFileName cho CSD201)
router.post('/:id/testcases', (req, res, next) => assignmentController.addTestCases(req, res, next));
router.get('/:id/testcases', (req, res, next) => assignmentController.getTestCases(req, res, next));
router.put('/testcases/:testCaseId', (req, res, next) => assignmentController.updateTestCase(req, res, next));
router.delete('/testcases/:testCaseId', (req, res, next) => assignmentController.deleteTestCase(req, res, next));

// Quản lý Barem Rubric (chấm AI ngữ nghĩa)
router.post('/:id/rubrics', (req, res, next) => assignmentController.setRubricRules(req, res, next));
router.get('/:id/rubrics', (req, res, next) => assignmentController.getRubricRules(req, res, next));

// Quản lý Đáp án mẫu (Model Solution cho RAG Vector DB)
router.post('/:id/solutions', (req, res, next) => assignmentController.upsertSolution(req, res, next));
router.get('/:id/solutions', (req, res, next) => assignmentController.getSolutions(req, res, next));

export default router;
