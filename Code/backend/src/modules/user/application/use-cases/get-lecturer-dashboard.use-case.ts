import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export interface LecturerDashboardResponse {
  lecturer: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    status: string;
    lastLoginAt?: Date | null;
  };
  teachingStats: {
    totalCourses: number;
    totalStudents: number;
    totalAssignments: number;
    totalSubmissions: number;
    averageScore: number;
    pendingGradingCount: number;
  };
  coursesOverview: Array<{
    id: string;
    code: string;
    name: string;
    semester: string;
    isActive: boolean;
    enrollmentCode?: string | null;
    codeExpiresAt?: Date | null;
    totalStudents: number;
    totalAssignments: number;
    totalSubmissions: number;
    averageScore: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    assignmentId: string;
    assignmentTitle: string;
    courseCode: string;
    courseName: string;
    paperCode?: string | null;
    submittedAt: Date;
    status: string;
    sandboxScore: number;
    aiScore: number;
    finalScore: number;
  }>;
  assignmentsSummary: Array<{
    id: string;
    title: string;
    courseCode: string;
    status: string;
    environment: string;
    deadline: Date;
    durationMinutes?: number | null;
    hasAccessCode: boolean;
    totalSubmissions: number;
    averageScore: number;
  }>;
}

export class GetLecturerDashboardUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(lecturerId: string): Promise<LecturerDashboardResponse> {
    // 1. Kiểm tra Giảng viên
    const lecturer = await this.prisma.user.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer) {
      throw new NotFoundError('Giảng viên');
    }

    // 2. Lấy tất cả các khóa học do giảng viên này phụ trách
    const courses = await this.prisma.course.findMany({
      where: { lecturerId },
      include: {
        enrollments: {
          select: { studentId: true },
        },
        assignments: {
          include: {
            submissions: {
              include: {
                user: { select: { id: true, fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Tính toán thống kê chi tiết
    const allStudentIdsSet = new Set<string>();
    let totalAssignmentsCount = 0;
    let totalSubmissionsCount = 0;
    let pendingGradingCount = 0;
    let totalGradedScoresSum = 0;
    let totalGradedCount = 0;

    const allSubmissions: any[] = [];
    const assignmentsSummaryList: any[] = [];

    const coursesOverview = courses.map((course: any) => {
      // Đếm sinh viên duy nhất
      for (const enr of course.enrollments) {
        allStudentIdsSet.add(enr.studentId);
      }

      let courseSubmissionsCount = 0;
      let courseScoreSum = 0;
      let courseGradedCount = 0;

      for (const assignment of course.assignments) {
        totalAssignmentsCount++;

        let assignmentScoreSum = 0;
        let assignmentGradedCount = 0;

        for (const sub of assignment.submissions) {
          totalSubmissionsCount++;
          courseSubmissionsCount++;

          if (sub.status === 'PENDING' || sub.status === 'QUEUED' || sub.status === 'RUNNING_SANDBOX' || sub.status === 'RUNNING_AI') {
            pendingGradingCount++;
          }

          if (sub.status === 'GRADED' && sub.finalScore !== null) {
            const score = Number(sub.finalScore);
            totalGradedScoresSum += score;
            totalGradedCount++;
            courseScoreSum += score;
            courseGradedCount++;
            assignmentScoreSum += score;
            assignmentGradedCount++;
          }

          allSubmissions.push({
            id: sub.id,
            studentId: sub.user?.id,
            studentName: sub.user?.fullName || 'N/A',
            studentEmail: sub.user?.email || 'N/A',
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            courseCode: course.code,
            courseName: course.name,
            paperCode: sub.paperCode,
            submittedAt: sub.submittedAt,
            status: sub.status,
            sandboxScore: Number(sub.sandboxScore || 0),
            aiScore: Number(sub.aiScore || 0),
            finalScore: Number(sub.finalScore || 0),
          });
        }

        assignmentsSummaryList.push({
          id: assignment.id,
          title: assignment.title,
          courseCode: course.code,
          status: assignment.status,
          environment: assignment.environment,
          deadline: assignment.deadline,
          durationMinutes: assignment.durationMinutes,
          hasAccessCode: !!assignment.accessCode,
          totalSubmissions: assignment.submissions.length,
          averageScore:
            assignmentGradedCount > 0
              ? Math.round((assignmentScoreSum / assignmentGradedCount) * 100) / 100
              : 0,
        });
      }

      const courseAverageScore =
        courseGradedCount > 0
          ? Math.round((courseScoreSum / courseGradedCount) * 100) / 100
          : 0;

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        semester: course.semester,
        isActive: course.isActive,
        enrollmentCode: course.enrollmentCode,
        codeExpiresAt: course.codeExpiresAt,
        totalStudents: course.enrollments.length,
        totalAssignments: course.assignments.length,
        totalSubmissions: courseSubmissionsCount,
        averageScore: courseAverageScore,
      };
    });

    // 4. Lấy danh sách 10 bài nộp gần đây nhất trên tất cả các lớp của giảng viên
    allSubmissions.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    const recentSubmissions = allSubmissions.slice(0, 10);

    const overallAverageScore =
      totalGradedCount > 0
        ? Math.round((totalGradedScoresSum / totalGradedCount) * 100) / 100
        : 0;

    return {
      lecturer: {
        id: lecturer.id,
        email: lecturer.email,
        fullName: lecturer.fullName,
        avatarUrl: lecturer.avatarUrl,
        role: lecturer.role,
        status: lecturer.status,
        lastLoginAt: lecturer.lastLoginAt,
      },
      teachingStats: {
        totalCourses: courses.length,
        totalStudents: allStudentIdsSet.size,
        totalAssignments: totalAssignmentsCount,
        totalSubmissions: totalSubmissionsCount,
        averageScore: overallAverageScore,
        pendingGradingCount,
      },
      coursesOverview,
      recentSubmissions,
      assignmentsSummary: assignmentsSummaryList.slice(0, 10),
    };
  }
}
