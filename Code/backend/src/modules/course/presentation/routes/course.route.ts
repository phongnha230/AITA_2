import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { CreateCourseUseCase } from '../../application/use-cases/create-course.use-case.js';
import { GetCoursesUseCase } from '../../application/use-cases/get-courses.use-case.js';
import { GetCourseByIdUseCase } from '../../application/use-cases/get-course-by-id.use-case.js';
import { UpdateCourseUseCase } from '../../application/use-cases/update-course.use-case.js';
import { DeleteCourseUseCase } from '../../application/use-cases/delete-course.use-case.js';
import { EnrollStudentsUseCase } from '../../application/use-cases/enroll-students.use-case.js';
import { RemoveStudentUseCase } from '../../application/use-cases/remove-student.use-case.js';
import { GenerateJoinCodeUseCase } from '../../application/use-cases/generate-join-code.use-case.js';
import { RevokeJoinCodeUseCase } from '../../application/use-cases/revoke-join-code.use-case.js';
import { JoinCourseByCodeUseCase } from '../../application/use-cases/join-course-by-code.use-case.js';
import { PrismaCourseRepository } from '../../infrastructure/repositories/prisma-course.repository.js';
import { PrismaUserRepository } from '../../../user/infrastructure/repositories/prisma-user.repository.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
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

// Composition Root for Course
const courseRepository = new PrismaCourseRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

const createCourseUseCase = new CreateCourseUseCase(courseRepository, userRepository);
const getCoursesUseCase = new GetCoursesUseCase(courseRepository);
const getCourseByIdUseCase = new GetCourseByIdUseCase(courseRepository);
const updateCourseUseCase = new UpdateCourseUseCase(courseRepository);
const deleteCourseUseCase = new DeleteCourseUseCase(courseRepository);
const enrollStudentsUseCase = new EnrollStudentsUseCase(courseRepository);
const removeStudentUseCase = new RemoveStudentUseCase(courseRepository);
const generateJoinCodeUseCase = new GenerateJoinCodeUseCase(courseRepository);
const revokeJoinCodeUseCase = new RevokeJoinCodeUseCase(courseRepository);
const joinCourseByCodeUseCase = new JoinCourseByCodeUseCase(courseRepository);

const courseController = new CourseController(
  createCourseUseCase,
  getCoursesUseCase,
  getCourseByIdUseCase,
  updateCourseUseCase,
  deleteCourseUseCase,
  enrollStudentsUseCase,
  removeStudentUseCase,
  generateJoinCodeUseCase,
  revokeJoinCodeUseCase,
  joinCourseByCodeUseCase
);

// Routes
router.get('/', authenticateJWT, validateQuery(QueryCoursesSchema), courseController.getCourses);

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
