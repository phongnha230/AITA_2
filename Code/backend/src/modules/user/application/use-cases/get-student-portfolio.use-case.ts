import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export interface StudentPortfolioResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
    status: string;
    createdAt: Date;
    lastLoginAt?: Date | null;
  };
  academicStats: {
    totalCourses: number;
    totalAssignments: number;
    submittedAssignments: number;
    completionRate: number; // percentage (0 - 100)
    averageScore: number;   // 0.00 - 10.00
    highestScore: number;   // 0.00 - 10.00
    passedCount: number;    // submissions with finalScore >= 5.0
    failedCount: number;    // submissions with finalScore < 5.0
  };
  enrolledCourses: Array<{
    id: string;
    code: string;
    name: string;
    semester: string;
    lecturer: {
      id: string;
      fullName: string;
      email: string;
    };
    enrolledAt: Date;
    totalAssignments: number;
    submittedAssignments: number;
    averageScore: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    assignmentId: string;
    assignmentTitle: string;
    courseCode: string;
    courseName: string;
    environment: string;
    paperCode?: string | null;
    submissionChannel: string;
    submittedAt: Date;
    status: string;
    sandboxScore: number;
    aiScore: number;
    finalScore: number;
  }>;
  skillsBreakdown: Array<{
    environment: string;
    submissionCount: number;
    averageScore: number;
  }>;
  aiTutorStats: {
    totalConversations: number;
    totalMessagesCount: number;
  };
}

export class GetStudentPortfolioUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(userId: string): Promise<StudentPortfolioResponse> {
    // 1. Kiểm tra tồn tại của User
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Sinh viên');
    }

    // 2. Lấy danh sách Enrollments kèm khóa học & bài tập của khóa học
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: {
            lecturer: {
              select: { id: true, fullName: true, email: true },
            },
            assignments: {
              select: { id: true, title: true, environment: true, status: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    // 3. Lấy tất cả Submissions của sinh viên kèm Assignment & Course
    const submissions = await this.prisma.submission.findMany({
      where: { userId },
      include: {
        assignment: {
          include: {
            course: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // 4. Lấy thống kê AI Tutor Conversations & Messages
    const aiConversations = await this.prisma.aiTutorConversation.findMany({
      where: { studentId: userId },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    const totalConversations = aiConversations.length;
    const totalMessagesCount = aiConversations.reduce(
      (sum: number, c: any) => sum + (c._count?.messages || 0),
      0
    );

    // 5. Tính toán các chỉ số Academic Stats
    let totalAssignmentsAcrossCourses = 0;
    const assignmentIdsSet = new Set<string>();

    for (const enrollment of enrollments) {
      for (const assignment of enrollment.course.assignments) {
        if (!assignmentIdsSet.has(assignment.id)) {
          assignmentIdsSet.add(assignment.id);
          totalAssignmentsAcrossCourses++;
        }
      }
    }

    const uniqueSubmittedAssignmentIds = new Set<string>();
    const gradedSubmissions: any[] = [];

    for (const sub of submissions) {
      uniqueSubmittedAssignmentIds.add(sub.assignmentId);
      if (sub.status === 'GRADED' && sub.finalScore !== null) {
        gradedSubmissions.push(sub);
      }
    }

    const submittedAssignmentsCount = uniqueSubmittedAssignmentIds.size;
    const completionRate =
      totalAssignmentsAcrossCourses > 0
        ? Math.round((submittedAssignmentsCount / totalAssignmentsAcrossCourses) * 100)
        : 0;

    let totalScoreSum = 0;
    let highestScore = 0;
    let passedCount = 0;
    let failedCount = 0;

    for (const sub of gradedSubmissions) {
      const score = Number(sub.finalScore);
      totalScoreSum += score;
      if (score > highestScore) highestScore = score;
      if (score >= 5.0) {
        passedCount++;
      } else {
        failedCount++;
      }
    }

    const averageScore =
      gradedSubmissions.length > 0
        ? Math.round((totalScoreSum / gradedSubmissions.length) * 100) / 100
        : 0;

    // 6. Tính toán Course Breakdown
    const enrolledCourses = enrollments.map((enr: any) => {
      const courseAssignments = enr.course.assignments || [];
      const courseSubmissions = submissions.filter(
        (s: any) => s.assignment?.course?.id === enr.course.id
      );

      const uniqueSubmittedInCourse = new Set(courseSubmissions.map((s: any) => s.assignmentId));
      const gradedInCourse = courseSubmissions.filter(
        (s: any) => s.status === 'GRADED' && s.finalScore !== null
      );

      const courseScoreSum = gradedInCourse.reduce(
        (acc: number, cur: any) => acc + Number(cur.finalScore),
        0
      );
      const courseAvg =
        gradedInCourse.length > 0
          ? Math.round((courseScoreSum / gradedInCourse.length) * 100) / 100
          : 0;

      return {
        id: enr.course.id,
        code: enr.course.code,
        name: enr.course.name,
        semester: enr.course.semester,
        lecturer: enr.course.lecturer,
        enrolledAt: enr.enrolledAt,
        totalAssignments: courseAssignments.length,
        submittedAssignments: uniqueSubmittedInCourse.size,
        averageScore: courseAvg,
      };
    });

    // 7. Recent Submissions (tối đa 10 bài)
    const recentSubmissions = submissions.slice(0, 10).map((s: any) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment?.title || 'Unknown Assignment',
      courseCode: s.assignment?.course?.code || 'N/A',
      courseName: s.assignment?.course?.name || 'N/A',
      environment: s.assignment?.environment || 'C_GCC',
      paperCode: s.paperCode,
      submissionChannel: s.submissionChannel,
      submittedAt: s.submittedAt,
      status: s.status,
      sandboxScore: Number(s.sandboxScore || 0),
      aiScore: Number(s.aiScore || 0),
      finalScore: Number(s.finalScore || 0),
    }));

    // 8. Skills Breakdown theo Ngôn ngữ lập trình / Môi trường
    const envMap = new Map<string, { count: number; totalScore: number; gradedCount: number }>();

    for (const sub of submissions) {
      const env = sub.assignment?.environment || 'OTHER';
      const existing = envMap.get(env) || { count: 0, totalScore: 0, gradedCount: 0 };
      existing.count += 1;
      if (sub.status === 'GRADED' && sub.finalScore !== null) {
        existing.totalScore += Number(sub.finalScore);
        existing.gradedCount += 1;
      }
      envMap.set(env, existing);
    }

    const skillsBreakdown = Array.from(envMap.entries()).map(([environment, data]) => ({
      environment,
      submissionCount: data.count,
      averageScore:
        data.gradedCount > 0
          ? Math.round((data.totalScore / data.gradedCount) * 100) / 100
          : 0,
    }));

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      academicStats: {
        totalCourses: enrollments.length,
        totalAssignments: totalAssignmentsAcrossCourses,
        submittedAssignments: submittedAssignmentsCount,
        completionRate,
        averageScore,
        highestScore: Math.round(highestScore * 100) / 100,
        passedCount,
        failedCount,
      },
      enrolledCourses,
      recentSubmissions,
      skillsBreakdown,
      aiTutorStats: {
        totalConversations,
        totalMessagesCount,
      },
    };
  }
}
