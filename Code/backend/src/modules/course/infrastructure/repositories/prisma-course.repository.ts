import { PrismaClient, Course as PrismaCourseModel } from '@prisma/client';
import { ICourseRepository, FindCoursesFilter } from '../../domain/repositories/course.repository.interface.js';
import { Course } from '../../domain/entities/course.entity.js';

export class PrismaCourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): Course {
    return new Course({
      id: raw.id,
      code: raw.code,
      name: raw.name,
      semester: raw.semester,
      lecturerId: raw.lecturerId,
      isActive: raw.isActive,
      enrollmentCode: raw.enrollmentCode,
      codeExpiresAt: raw.codeExpiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      lecturer: raw.lecturer
        ? {
            id: raw.lecturer.id,
            fullName: raw.lecturer.fullName,
            email: raw.lecturer.email,
          }
        : undefined,
      enrollmentCount: raw._count?.enrollments ?? (Array.isArray(raw.enrollments) ? raw.enrollments.length : undefined),
      assignmentCount: raw._count?.assignments ?? (Array.isArray(raw.assignments) ? raw.assignments.length : undefined),
      enrolledStudentIds: Array.isArray(raw.enrollments)
        ? raw.enrollments.map((e: any) => e.studentId || e.student?.id).filter(Boolean)
        : undefined,
    });
  }

  async findById(id: string): Promise<Course | null> {
    const raw = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByCodeAndSemester(code: string, semester: string): Promise<Course | null> {
    const raw = await this.prisma.course.findUnique({
      where: {
        uk_course_code_semester: {
          code,
          semester,
        },
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByEnrollmentCode(enrollmentCode: string): Promise<Course | null> {
    const raw = await this.prisma.course.findUnique({
      where: {
        enrollmentCode: enrollmentCode.toUpperCase().trim(),
      },
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findDetailedById(id: string): Promise<any | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true },
        },
        assignments: {
          select: {
            id: true,
            title: true,
            description: true,
            environment: true,
            submissionType: true,
            startTime: true,
            deadline: true,
            status: true,
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
                avatarUrl: true,
                role: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return course;
  }

  async create(data: {
    code: string;
    name: string;
    semester: string;
    lecturerId: string;
  }): Promise<Course> {
    const raw = await this.prisma.course.create({
      data: {
        code: data.code,
        name: data.name,
        semester: data.semester,
        lecturerId: data.lecturerId,
      },
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    return this.toDomain(raw);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      semester: string;
      isActive: boolean;
    }>
  ): Promise<Course> {
    const raw = await this.prisma.course.update({
      where: { id },
      data,
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    return this.toDomain(raw);
  }

  async updateEnrollmentCode(
    courseId: string,
    code: string | null,
    expiresAt: Date | null
  ): Promise<Course> {
    const raw = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        enrollmentCode: code,
        codeExpiresAt: expiresAt,
      },
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({
      where: { id },
    });
  }

  async findAll(filter?: FindCoursesFilter): Promise<Course[]> {
    const where: any = {};
    if (filter?.lecturerId) where.lecturerId = filter.lecturerId;
    if (filter?.studentId) {
      where.enrollments = {
        some: { studentId: filter.studentId },
      };
    }
    if (filter?.search) {
      where.OR = [
        { code: { contains: filter.search } },
        { name: { contains: filter.search } },
      ];
    }

    const rawList = await this.prisma.course.findMany({
      where,
      include: {
        lecturer: {
          select: { id: true, fullName: true, email: true },
        },
        enrollments: {
          select: { studentId: true },
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

    return rawList.map((r: any) => this.toDomain(r));
  }

  async enrollStudents(courseId: string, studentIds: string[]): Promise<number> {
    let count = 0;
    for (const studentId of studentIds) {
      await this.prisma.courseEnrollment.upsert({
        where: {
          uk_enrollment_course_student: {
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
      count++;
    }
    return count;
  }

  async removeStudent(courseId: string, studentId: string): Promise<void> {
    await this.prisma.courseEnrollment.deleteMany({
      where: {
        courseId,
        studentId,
      },
    });
  }

  async isStudentEnrolled(courseId: string, studentId: string): Promise<boolean> {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        uk_enrollment_course_student: {
          courseId,
          studentId,
        },
      },
    });
    return !!enrollment;
  }
}
