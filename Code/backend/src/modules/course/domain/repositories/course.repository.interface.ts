import { Course } from '../entities/course.entity.js';

export interface FindCoursesFilter {
  lecturerId?: string;
  studentId?: string;
  search?: string;
}

export interface ICourseRepository {
  findById(id: string): Promise<Course | null>;
  findByCodeAndSemester(code: string, semester: string): Promise<Course | null>;
  findByEnrollmentCode(enrollmentCode: string): Promise<Course | null>;
  findDetailedById(id: string): Promise<any | null>;
  create(data: {
    code: string;
    name: string;
    semester: string;
    lecturerId: string;
  }): Promise<Course>;
  update(id: string, data: Partial<{
    name: string;
    semester: string;
    isActive: boolean;
  }>): Promise<Course>;
  updateEnrollmentCode(courseId: string, code: string | null, expiresAt: Date | null): Promise<Course>;
  delete(id: string): Promise<void>;
  findAll(filter?: FindCoursesFilter): Promise<Course[]>;
  enrollStudents(courseId: string, studentIds: string[]): Promise<number>;
  removeStudent(courseId: string, studentId: string): Promise<void>;
  isStudentEnrolled(courseId: string, studentId: string): Promise<boolean>;
}
