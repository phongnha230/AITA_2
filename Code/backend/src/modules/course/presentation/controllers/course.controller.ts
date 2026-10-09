import { Request, Response, NextFunction } from 'express';
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
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';

export class CourseController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly getCoursesUseCase: GetCoursesUseCase,
    private readonly getCourseByIdUseCase: GetCourseByIdUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
    private readonly enrollStudentsUseCase: EnrollStudentsUseCase,
    private readonly removeStudentUseCase: RemoveStudentUseCase,
    private readonly generateJoinCodeUseCase: GenerateJoinCodeUseCase,
    private readonly revokeJoinCodeUseCase: RevokeJoinCodeUseCase,
    private readonly joinCourseByCodeUseCase: JoinCourseByCodeUseCase
  ) {}

  createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = req.user;
      let lecturerId = req.body.lecturerId;
      // Nếu là LECTURER, bắt buộc khóa học phải thuộc về chính mình
      if (currentUser?.role === 'LECTURER' || !lecturerId) {
        lecturerId = currentUser?.userId;
      }
      const course = await this.createCourseUseCase.execute({ ...req.body, lecturerId });
      sendSuccess(res, course, 'Tạo khóa học thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  getCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let { lecturerId, studentId, search } = req.query as any;
      const currentUser = req.user;

      // Data Isolation Policy:
      // - LECTURER: Chỉ xem các môn học do chính mình phụ trách
      if (currentUser?.role === 'LECTURER') {
        lecturerId = currentUser.userId;
      }
      // - STUDENT: Chỉ xem các môn học mình đã ghi danh
      else if (currentUser?.role === 'STUDENT') {
        studentId = currentUser.userId;
      }
      // - ADMIN: Toàn quyền xem mọi khóa học hoặc filter tự do

      const courses = await this.getCoursesUseCase.execute({ lecturerId, studentId, search });
      sendSuccess(res, courses, 'Lấy danh sách khóa học thành công.');
    } catch (error) {
      next(error);
    }
  };

  getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.getCourseByIdUseCase.execute(req.params.id);
      sendSuccess(res, course, 'Lấy chi tiết khóa học thành công.');
    } catch (error) {
      next(error);
    }
  };

  updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      const course = await this.updateCourseUseCase.execute(req.params.id, req.body, requester);
      sendSuccess(res, course, 'Cập nhật khóa học thành công.');
    } catch (error) {
      next(error);
    }
  };

  deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      await this.deleteCourseUseCase.execute(req.params.id, requester);
      sendSuccess(res, null, 'Đã xóa khóa học thành công.');
    } catch (error) {
      next(error);
    }
  };

  enrollStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      const result = await this.enrollStudentsUseCase.execute(req.params.id, req.body.studentIds, requester);
      sendSuccess(res, result, `Đã ghi danh ${result.enrolledCount} sinh viên vào lớp học thành công!`, 200);
    } catch (error) {
      next(error);
    }
  };

  removeStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      await this.removeStudentUseCase.execute(req.params.id, req.params.studentId, requester);
      sendSuccess(res, null, 'Đã xóa sinh viên khỏi lớp học thành công.');
    } catch (error) {
      next(error);
    }
  };

  generateJoinCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      const result = await this.generateJoinCodeUseCase.execute(req.params.id, req.body, requester);
      sendSuccess(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  };

  revokeJoinCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requester = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      const result = await this.revokeJoinCodeUseCase.execute(req.params.id, requester);
      sendSuccess(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  };

  joinCourseByCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = req.user!.userId;
      const result = await this.joinCourseByCodeUseCase.execute(studentId, req.body);
      sendSuccess(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  };
}
