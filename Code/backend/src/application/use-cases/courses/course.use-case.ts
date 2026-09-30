import prisma from '../../../infrastructure/database/prisma.client.js';

export interface CreateCourseInput {
  code: string;
  name: string;
  description?: string;
  lecturerId: string;
  semester: string;
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
  semester?: string;
}

export class CourseUseCase {
  /**
   * Tạo khóa học / lớp học mới
   */
  async createCourse(input: CreateCourseInput) {
    if (!input.code || !input.name || !input.lecturerId || !input.semester) {
      throw new Error('Mã môn học, tên môn học, giảng viên và học kỳ là bắt buộc');
    }

    // Kiểm tra giảng viên tồn tại
    const lecturer = await prisma.user.findUnique({
      where: { id: input.lecturerId },
    });

    if (!lecturer) {
      throw new Error(`Không tìm thấy giảng viên với ID: ${input.lecturerId}`);
    }

    const course = await prisma.course.create({
      data: {
        code: input.code.toUpperCase().trim(),
        name: input.name.trim(),
        description: input.description,
        lecturerId: input.lecturerId,
        semester: input.semester.trim(),
      },
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return course;
  }

  /**
   * Lấy danh sách khóa học (lọc theo giảng viên hoặc sinh viên)
   */
  async getCourses(filters?: { lecturerId?: string; studentId?: string }) {
    const whereClause: any = {};

    if (filters?.lecturerId) {
      whereClause.lecturerId = filters.lecturerId;
    }

    if (filters?.studentId) {
      whereClause.enrollments = {
        some: {
          studentId: filters.studentId,
        },
      };
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses;
  }

  /**
   * Lấy chi tiết khóa học kèm danh sách đề thi và sinh viên đã ghi danh
   */
  async getCourseById(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lecturer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            deadline: true,
            maxScore: true,
            allowedLanguages: true,
            isTeamWork: true,
            createdAt: true,
            _count: {
              select: {
                submissions: true,
                testCases: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
                githubUsername: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new Error(`Không tìm thấy khóa học với ID: ${courseId}`);
    }

    return course;
  }

  /**
   * Cập nhật thông tin khóa học
   */
  async updateCourse(courseId: string, input: UpdateCourseInput) {
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw new Error(`Không tìm thấy khóa học với ID: ${courseId}`);
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        name: input.name ? input.name.trim() : undefined,
        description: input.description !== undefined ? input.description : undefined,
        semester: input.semester ? input.semester.trim() : undefined,
      },
    });

    return updated;
  }

  /**
   * Xóa khóa học
   */
  async deleteCourse(courseId: string) {
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      throw new Error(`Không tìm thấy khóa học với ID: ${courseId}`);
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: 'Đã xóa khóa học thành công' };
  }

  /**
   * Gán danh sách sinh viên vào khóa học
   */
  async enrollStudents(courseId: string, studentIds: string[]) {
    if (!studentIds || studentIds.length === 0) {
      throw new Error('Danh sách studentIds không được để trống');
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error(`Không tìm thấy khóa học với ID: ${courseId}`);
    }

    const results = [];
    for (const studentId of studentIds) {
      // Upsert để tránh lỗi duplicate key nếu sinh viên đã được ghi danh
      const enrollment = await prisma.courseEnrollment.upsert({
        where: {
          courseId_studentId: {
            courseId,
            studentId,
          },
        },
        create: {
          courseId,
          studentId,
        },
        update: {},
      });
      results.push(enrollment);
    }

    return {
      message: `Đã ghi danh ${results.length} sinh viên vào khóa học`,
      enrolledCount: results.length,
    };
  }

  /**
   * Xóa sinh viên khỏi khóa học
   */
  async removeStudentFromCourse(courseId: string, studentId: string) {
    await prisma.courseEnrollment.deleteMany({
      where: {
        courseId,
        studentId,
      },
    });

    return { message: 'Đã xóa sinh viên khỏi khóa học thành công' };
  }
}

export const courseUseCase = new CourseUseCase();
