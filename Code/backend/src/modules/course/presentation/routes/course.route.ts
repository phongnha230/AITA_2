import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import {
  CreateCourseSchema,
  UpdateCourseSchema,
  EnrollStudentsSchema,
  QueryCoursesSchema,
  GenerateJoinCodeSchema,
  JoinCourseByCodeSchema,
} from '../../application/dtos/course.dto.js';

const router = Router();

const courseController = container.courseController;

// Routes
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER', 'STUDENT'),
  validateQuery(QueryCoursesSchema),
  courseController.getCourses
);

// Sinh viên tham gia lớp học bằng mã (đặt trước /:id)
router.post(
  '/join',
  authenticateJWT,
  validateBody(JoinCourseByCodeSchema),
  courseController.joinCourseByCode
);

router.get('/:id', authenticateJWT, courseController.getCourseById);
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  validateBody(CreateCourseSchema),
  courseController.createCourse
);
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  validateBody(UpdateCourseSchema),
  courseController.updateCourse
);
router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  courseController.deleteCourse
);
router.post(
  '/:id/enroll',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  validateBody(EnrollStudentsSchema),
  courseController.enrollStudents
);
router.delete(
  '/:id/students/:studentId',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  courseController.removeStudent
);

// Giảng viên sinh mã tham gia lớp học (TTL tùy chỉnh)
router.post(
  '/:id/generate-code',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  validateBody(GenerateJoinCodeSchema),
  courseController.generateJoinCode
);

// Giảng viên khóa / thu hồi mã tham gia lớp học
router.delete(
  '/:id/revoke-code',
  authenticateJWT,
  authorizeRoles('ADMIN', 'LECTURER'),
  courseController.revokeJoinCode
);

export default router;
