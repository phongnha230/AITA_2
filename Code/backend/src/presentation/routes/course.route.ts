import { Router } from 'express';
import { courseController } from '../controllers/course.controller.js';

const router = Router();

// CRUD Khóa học / Lớp học
router.post('/', (req, res, next) => courseController.createCourse(req, res, next));
router.get('/', (req, res, next) => courseController.getCourses(req, res, next));
router.get('/:id', (req, res, next) => courseController.getCourseById(req, res, next));
router.put('/:id', (req, res, next) => courseController.updateCourse(req, res, next));
router.delete('/:id', (req, res, next) => courseController.deleteCourse(req, res, next));

// Gán / Xóa sinh viên trong lớp học
router.post('/:id/enroll', (req, res, next) => courseController.enrollStudents(req, res, next));
router.delete('/:id/students/:studentId', (req, res, next) => courseController.removeStudent(req, res, next));

export default router;
