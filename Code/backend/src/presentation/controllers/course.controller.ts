import { Request, Response, NextFunction } from 'express';
import { courseUseCase } from '../../application/use-cases/courses/course.use-case.js';

export class CourseController {
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseUseCase.createCourse(req.body);
      return res.status(201).json({
        success: true,
        message: 'Tạo khóa học thành công',
        data: course,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const { lecturerId, studentId } = req.query;
      const courses = await courseUseCase.getCourses({
        lecturerId: lecturerId as string | undefined,
        studentId: studentId as string | undefined,
      });

      return res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseUseCase.getCourseById(id);

      return res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await courseUseCase.updateCourse(id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Cập nhật khóa học thành công',
        data: updated,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await courseUseCase.deleteCourse(id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async enrollStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { studentIds } = req.body;
      const result = await courseUseCase.enrollStudents(id, studentIds);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async removeStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, studentId } = req.params;
      const result = await courseUseCase.removeStudentFromCourse(id, studentId);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
