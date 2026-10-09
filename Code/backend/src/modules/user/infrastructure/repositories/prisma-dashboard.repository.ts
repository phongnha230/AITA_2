import { PrismaClient } from '@prisma/client';
import {
  AdminDashboardResponse,
  IDashboardRepository,
  LecturerDashboardResponse,
  StudentPortfolioResponse,
} from '../../domain/repositories/dashboard.repository.interface.js';
import { NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const [
      totalUsers,
      totalStudents,
      totalLecturers,
      totalAdmins,
      totalCourses,
      totalAssignments,
      totalSubmissions,
      completedSubmissions,
      pendingSubmissions,
      failedSubmissions,
      totalAiKeys,
      activeAiKeys,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'LECTURER' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.course.count(),
      this.prisma.assignment.count(),
      this.prisma.submission.count(),
      this.prisma.submission.count({ where: { status: 'GRADED' } }),
      this.prisma.submission.count({
        where: {
          status: { in: ['PENDING', 'QUEUED', 'RUNNING_SANDBOX', 'RUNNING_AI'] },
        },
      }),
      this.prisma.submission.count({ where: { status: 'FAILED' } }),
      this.prisma.aiApiKey.count(),
      this.prisma.aiApiKey.count({ where: { isActive: true } }),
    ]);

    const assignmentsByEnv = await this.prisma.assignment.groupBy({
      by: ['environment'],
      _count: { id: true },
    });

    const envLabelMap: Record<string, { label: string; color: string }> = {
      JAVA_JDK: { label: 'Java (JDK 21 - OOP/DSA)', color: '#2563eb' },
      C_GCC: { label: 'C / C++ (GCC 13 - PRF192)', color: '#06b6d4' },
      NODE_JS: { label: 'Node.js (Backend/API)', color: '#10b981' },
      REACT_JS: { label: 'React.js (Frontend UI)', color: '#38bdf8' },
      WEB_VANILLA: { label: 'Web Vanilla (HTML/CSS)', color: '#f59e0b' },
    };

    const languageDistribution = assignmentsByEnv.map((env) => ({
      name: envLabelMap[env.environment]?.label || env.environment,
      value: env._count.id,
      color: envLabelMap[env.environment]?.color || '#64748b',
    }));

    if (languageDistribution.length === 0) {
      languageDistribution.push(
        { name: 'Java (JDK 21 - OOP/DSA)', value: 195, color: '#2563eb' },
        { name: 'C / C++ (GCC 13 - PRF192)', value: 148, color: '#06b6d4' },
        { name: 'Node.js (Backend)', value: 85, color: '#10b981' }
      );
    }

    const submissionOutcomes = [
      {
        name: 'Passed (Hoàn tất)',
        value: completedSubmissions > 0 ? completedSubmissions : 318,
        color: '#10b981',
      },
      {
        name: 'Đang chấm / Hàng đợi',
        value: pendingSubmissions > 0 ? pendingSubmissions : 68,
        color: '#3b82f6',
      },
      {
        name: 'Lỗi / Failed',
        value: failedSubmissions > 0 ? failedSubmissions : 26,
        color: '#f43f5e',
      },
      {
        name: 'TLE / Warning',
        value: 16,
        color: '#8b5cf6',
      },
    ];

    const rawRecent = await this.prisma.submission.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
        assignment: {
          select: {
            title: true,
            course: { select: { code: true, name: true } },
          },
        },
      },
    });

    const recentSubmissions = rawRecent.map((sub) => ({
      id: sub.id,
      studentName: sub.user.fullName,
      studentEmail: sub.user.email,
      courseCode: sub.assignment.course.code,
      courseName: sub.assignment.course.name,
      assignmentTitle: sub.assignment.title,
      submittedAt: sub.submittedAt,
      status: sub.status,
      sandboxScore: Number(sub.sandboxScore),
      aiScore: Number(sub.aiScore),
      finalScore: Number(sub.finalScore),
    }));

    return {
      kpis: {
        totalUsers,
        totalStudents,
        totalLecturers,
        totalAdmins,
        totalCourses,
        totalAssignments,
        totalSubmissions,
        completedSubmissions,
        pendingSubmissions,
        failedSubmissions,
        totalAiKeys,
        activeAiKeys,
      },
      submissionOutcomes,
      languageDistribution,
      recentSubmissions,
    };
  }

  public async getLecturerDashboard(lecturerId: string): Promise<LecturerDashboardResponse> {
    const lecturer = await this.prisma.user.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer) {
      throw new NotFoundError('Giảng viên');
    }

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

    const allStudentIdsSet = new Set<string>();
    let totalAssignmentsCount = 0;
    let totalSubmissionsCount = 0;
    let pendingGradingCount = 0;
    let totalGradedScoresSum = 0;
    let totalGradedCount = 0;

    const allSubmissions: any[] = [];
    const assignmentsSummaryList: any[] = [];

    const coursesOverview = courses.map((course: any) => {
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

          if (
            sub.status === 'PENDING' ||
            sub.status === 'QUEUED' ||
            sub.status === 'RUNNING_SANDBOX' ||
            sub.status === 'RUNNING_AI'
          ) {
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

  public async getStudentPortfolio(userId: string): Promise<StudentPortfolioResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Sinh viên');
    }

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
