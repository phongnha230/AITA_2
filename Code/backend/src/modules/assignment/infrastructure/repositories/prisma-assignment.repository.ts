import { Assignment as PrismaAssignmentModel, AssignmentSolution, PrismaClient, RubricRule, TestCase } from '@prisma/client';
import {
  AssignmentDetailRecord,
  AssignmentListRecord,
  IAssignmentRepository,
  CreateAssignmentData,
  ProctoringAssignmentRecord,
  ProctoringRoomRecord,
  ExamSessionStatus,
} from '../../domain/repositories/assignment.repository.interface.js';
import { Assignment, AssignmentEnv } from '../../domain/entities/assignment.entity.js';
import { createHash } from 'node:crypto';
import { CreateTestCaseDto, SetRubricRulesDto, UpsertSolutionDto } from '../../application/dtos/assignment.dto.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../../shared/domain/exceptions/app.error.js';

export class PrismaAssignmentRepository implements IAssignmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: PrismaAssignmentModel): Assignment {
    return new Assignment({
      id: raw.id,
      courseId: raw.courseId,
      title: raw.title,
      description: raw.description,
      environment: raw.environment as AssignmentEnv,
      submissionType: raw.submissionType,
      startTime: raw.startTime,
      deadline: raw.deadline,
      durationMinutes: raw.durationMinutes,
      accessCode: raw.accessCode,
      maxFileSizeBytes: raw.maxFileSizeBytes,
      allowGitSubmission: raw.allowGitSubmission,
      allowZipSubmission: raw.allowZipSubmission,
      status: raw.status,
      pausedAt: raw.pausedAt,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      gradingVersion: raw.gradingVersion,
      gradingApprovalMode: raw.gradingApprovalMode,
      functionalMaxScore: Number(raw.functionalMaxScore),
      algorithmMaxScore: Number(raw.algorithmMaxScore),
      cleanCodeMaxScore: Number(raw.cleanCodeMaxScore),
      pdfFilePath: raw.pdfFilePath,
      starterCodePath: raw.starterCodePath,
    });
  }

  async findById(id: string): Promise<Assignment | null> {
    const raw = await this.prisma.assignment.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async unlockExam(assignmentId: string, studentId: string, accessCode: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, course: { enrollments: { some: { studentId } } } },
      select: { id: true, status: true, accessCode: true, startTime: true, deadline: true, durationMinutes: true, pausedAt: true },
    });
    if (!assignment) throw new ForbiddenError('Không tìm thấy đề thi hoặc bạn chưa ghi danh môn học này.');
    if (assignment.status === 'DRAFT' || assignment.status === 'CLOSED' || assignment.status === 'ARCHIVED') {
      throw new ForbiddenError('Ca thi hiện không nhận lượt mở mới.');
    }
    if (!assignment.accessCode || assignment.accessCode.trim() !== accessCode.trim()) {
      throw new ForbiddenError('Mã đề không chính xác hoặc đề chưa được đặt mã.');
    }
    await this.prisma.assignmentExamAccess.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      create: { assignmentId, studentId },
      update: {},
    });
    return this.toExamSessionStatus(assignment);
  }

  async getExamSessionStatus(assignmentId: string, studentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, status: true, startTime: true, deadline: true, durationMinutes: true, pausedAt: true,
        course: { select: { enrollments: { where: { studentId }, select: { id: true }, take: 1 } } },
        examAccessGrants: { where: { studentId }, select: { id: true }, take: 1 } },
    });
    if (!assignment) throw new NotFoundError('Đề thi');
    if (assignment.course.enrollments.length === 0 || assignment.examAccessGrants.length === 0) {
      throw new ForbiddenError('Hãy ghi danh môn học và nhập đúng mã đề trước.');
    }
    return this.toExamSessionStatus(assignment);
  }

  async hasStudentExamAccess(assignmentId: string, studentId: string): Promise<boolean> {
    const grant = await this.prisma.assignmentExamAccess.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } }, select: { id: true },
    });
    return Boolean(grant);
  }

  private toExamSessionStatus(assignment: { id: string; status: string; startTime: Date; deadline: Date; durationMinutes: number | null; pausedAt: Date | null }): ExamSessionStatus {
    const now = Date.now();
    const status = assignment.status === 'PAUSED' ? 'PAUSED'
      : assignment.status === 'CLOSED' || assignment.status === 'ARCHIVED' || now > assignment.deadline.getTime()
      ? (assignment.status === 'CLOSED' || assignment.status === 'ARCHIVED' ? 'CLOSED' : 'ENDED')
      : now < assignment.startTime.getTime() ? 'UPCOMING' : 'OPEN';
    return { assignmentId: assignment.id, status: status as ExamSessionStatus['status'], assignmentStatus: assignment.status as ExamSessionStatus['assignmentStatus'], startTime: assignment.startTime,
      deadline: assignment.deadline, durationMinutes: assignment.durationMinutes, pausedAt: assignment.pausedAt };
  }

  async findDetailedById(id: string, includeHiddenTests: boolean = false): Promise<AssignmentDetailRecord | null> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true,
            lecturerId: true,
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        submissions: {
          select: {
            userId: true,
            finalScore: true,
            compileOutput: true,
          },
        },
        testCases: {
          where: includeHiddenTests ? {} : { isHidden: false },
          orderBy: { orderIndex: 'asc' },
        },
        rubricRules: {
          orderBy: { orderIndex: 'asc' },
        },
        solutions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            submissions: true,
            testCases: true,
            examAccessGrants: true,
          },
        },
      },
    });

    return assignment;
  }

  async findByCourseId(courseId: string): Promise<AssignmentListRecord[]> {
    return this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        _count: {
          select: {
            submissions: true,
            testCases: true,
            rubricRules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countSubmissions(assignmentId: string): Promise<number> {
    return this.prisma.submission.count({ where: { assignmentId } });
  }

  async saveComplete(
    assignmentId: string,
    data: CreateAssignmentData,
    testCases: CreateTestCaseDto[],
    rubricRules: SetRubricRulesDto['rules'],
    solution?: UpsertSolutionDto,
    removeSolution = false
  ): Promise<Assignment> {
    const assignment = await this.prisma.$transaction(async (transaction) => {
      const existing = await transaction.assignment.findUnique({
        where: { id: assignmentId },
        include: { _count: { select: { submissions: true } } },
      });
      if (existing && existing._count.submissions > 0) {
        throw new ConflictError('Không thể sửa đề thi sau khi đã có bài nộp.');
      }

      if (existing) {
        await transaction.assignment.update({
          where: { id: assignmentId },
          data: {
            courseId: data.courseId,
            title: data.title,
            description: data.description,
            environment: data.environment,
            submissionType: data.submissionType,
            startTime: data.startTime,
            deadline: data.deadline,
            durationMinutes: data.durationMinutes,
            accessCode: data.accessCode,
            allowGitSubmission: data.allowGitSubmission,
            allowZipSubmission: data.allowZipSubmission,
            status: data.status,
            pausedAt: data.status === 'PAUSED' ? existing.pausedAt : null,
            gradingVersion: data.gradingVersion,
            gradingApprovalMode: data.gradingApprovalMode,
            functionalMaxScore: data.functionalMaxScore,
            algorithmMaxScore: data.algorithmMaxScore,
            cleanCodeMaxScore: data.cleanCodeMaxScore,
            ...(data.pdfFilePath !== undefined ? { pdfFilePath: data.pdfFilePath } : {}),
            ...(data.starterCodePath !== undefined ? { starterCodePath: data.starterCodePath } : {}),
          },
        });
        await transaction.testCase.deleteMany({ where: { assignmentId } });
        await transaction.rubricRule.deleteMany({ where: { assignmentId } });
      } else {
        await transaction.assignment.create({
          data: {
            id: assignmentId,
            courseId: data.courseId,
            title: data.title,
            description: data.description,
            environment: data.environment,
            submissionType: data.submissionType || 'INDIVIDUAL',
            startTime: data.startTime || new Date(),
            deadline: data.deadline,
            durationMinutes: data.durationMinutes ?? 90,
            accessCode: data.accessCode?.trim() || null,
            allowGitSubmission: data.allowGitSubmission ?? true,
            allowZipSubmission: data.allowZipSubmission ?? true,
            status: data.status ?? 'PUBLISHED',
            gradingVersion: data.gradingVersion ?? 1,
            gradingApprovalMode: data.gradingApprovalMode ?? 'LECTURER_REVIEW',
            functionalMaxScore: data.functionalMaxScore ?? 8,
            algorithmMaxScore: data.algorithmMaxScore ?? 2,
            cleanCodeMaxScore: data.cleanCodeMaxScore ?? 0,
            pdfFilePath: data.pdfFilePath ?? null,
            starterCodePath: data.starterCodePath ?? null,
            createdBy: data.createdBy,
          },
        });
      }

      await transaction.testCase.createMany({
        data: testCases.map((testCase, index) => ({
          assignmentId,
          label: testCase.label,
          rationaleTag: testCase.rationaleTag ?? 'FUNCTIONAL',
          isHidden: Boolean(testCase.isHidden),
          timeLimitMs: testCase.timeLimitMs ?? 2000,
          memoryLimitKb: testCase.memoryLimitKb ?? 262144,
          points: testCase.points ?? 1,
          comparisonMode: testCase.comparisonMode ?? 'STDIO',
          stdinInput: testCase.stdinInput ?? null,
          expectedStdout: testCase.expectedStdout ?? null,
          inputFileName: testCase.inputFileName ?? null,
          inputFileContent: testCase.inputFileContent ?? null,
          expectedFileName: testCase.expectedFileName ?? null,
          expectedFileContent: testCase.expectedFileContent ?? null,
          paperCode: testCase.paperCode?.trim().toUpperCase() ?? null,
          orderIndex: testCase.orderIndex ?? index + 1,
        })),
      });
      await transaction.rubricRule.createMany({
        data: rubricRules.map((rule, index) => ({
          assignmentId,
          criterionName: rule.criterionName,
          description: rule.description,
          maxPoints: rule.maxPoints,
          weight: rule.weight ?? 1,
          orderIndex: rule.orderIndex ?? index + 1,
          criterionType: rule.criterionType ?? 'GENERAL',
        })),
      });

      if (solution) {
        const contentHash = createHash('sha256').update(JSON.stringify({
          sourceCode: solution.sourceCode,
          explanation: solution.explanation ?? null,
          expectedTimeComplexity: solution.expectedTimeComplexity ?? null,
          expectedSpaceComplexity: solution.expectedSpaceComplexity ?? null,
          acceptedStrategies: solution.acceptedStrategies ?? [],
          algorithmNotes: solution.algorithmNotes ?? null,
        }), 'utf8').digest('hex');
        await transaction.assignmentSolution.updateMany({
          where: { assignmentId, isActive: true },
          data: { isActive: false, activeKey: null },
        });
        await transaction.assignmentSolution.create({
          data: {
            assignmentId,
            activeKey: assignmentId,
            contentHash,
            indexStatus: 'PENDING',
            title: solution.title,
            sourceCode: solution.sourceCode,
            explanation: solution.explanation ?? null,
            expectedTimeComplexity: solution.expectedTimeComplexity ?? null,
            expectedSpaceComplexity: solution.expectedSpaceComplexity ?? null,
            acceptedStrategies: solution.acceptedStrategies ?? [],
            algorithmNotes: solution.algorithmNotes ?? null,
            isActive: true,
          },
        });
      } else if (removeSolution) {
        await transaction.assignmentSolution.updateMany({
          where: { assignmentId, isActive: true },
          data: { isActive: false, activeKey: null },
        });
      }

      const saved = await transaction.assignment.findUnique({ where: { id: assignmentId } });
      if (!saved) throw new Error(`Assignment ${assignmentId} not found after save.`);
      return saved;
    });
    return this.toDomain(assignment);
  }

  async create(data: CreateAssignmentData): Promise<Assignment> {
    const raw = await this.prisma.assignment.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        environment: data.environment,
        submissionType: data.submissionType || 'INDIVIDUAL',
        startTime: data.startTime || new Date(),
        deadline: data.deadline,
        durationMinutes: data.durationMinutes !== undefined ? data.durationMinutes : 90,
        accessCode: data.accessCode ? String(data.accessCode).trim() : null,
        maxFileSizeBytes: data.maxFileSizeBytes || BigInt(52428800),
        allowGitSubmission: data.allowGitSubmission !== undefined ? data.allowGitSubmission : true,
        allowZipSubmission: data.allowZipSubmission !== undefined ? data.allowZipSubmission : true,
        status: data.status || 'DRAFT',
        gradingVersion: data.gradingVersion ?? 1,
        gradingApprovalMode: data.gradingApprovalMode ?? 'LECTURER_REVIEW',
        functionalMaxScore: data.functionalMaxScore ?? 8,
        algorithmMaxScore: data.algorithmMaxScore ?? 2,
        cleanCodeMaxScore: data.cleanCodeMaxScore ?? 0,
        createdBy: data.createdBy,
      },
    });
    return this.toDomain(raw);
  }

  async update(id: string, data: Partial<CreateAssignmentData>): Promise<Assignment> {
    const raw = await this.prisma.assignment.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        environment: data.environment,
        submissionType: data.submissionType,
        startTime: data.startTime,
        deadline: data.deadline,
        durationMinutes: data.durationMinutes,
        accessCode: data.accessCode !== undefined ? (data.accessCode ? String(data.accessCode).trim() : null) : undefined,
        allowGitSubmission: data.allowGitSubmission,
        allowZipSubmission: data.allowZipSubmission,
        status: data.status,
        pausedAt: data.pausedAt,
      },
    });
    return this.toDomain(raw);
  }

  async deleteIfNoSubmissions(
    id: string
  ): Promise<'DELETED' | 'NOT_FOUND' | 'HAS_SUBMISSIONS'> {
    return this.prisma.$transaction(async (transaction) => {
      const assignment = await transaction.assignment.findUnique({
        where: { id },
        select: { _count: { select: { submissions: true } } },
      });
      if (!assignment) return 'NOT_FOUND';
      if (assignment._count.submissions > 0) return 'HAS_SUBMISSIONS';

      const deleted = await transaction.assignment.deleteMany({
        where: {
          id,
          submissions: { none: {} },
        },
      });
      return deleted.count === 1 ? 'DELETED' : 'HAS_SUBMISSIONS';
    });
  }

  // --- Test Cases ---
  async addTestCase(assignmentId: string, data: CreateTestCaseDto): Promise<TestCase> {
    return this.prisma.testCase.create({
      data: {
        assignmentId,
        label: data.label,
        rationaleTag: data.rationaleTag || 'FUNCTIONAL',
        isHidden: Boolean(data.isHidden),
        timeLimitMs: data.timeLimitMs || 2000,
        memoryLimitKb: data.memoryLimitKb || 262144,
        points: data.points || 1.0,
        comparisonMode: data.comparisonMode || 'STDIO',
        stdinInput: data.stdinInput ?? null,
        expectedStdout: data.expectedStdout ?? null,
        inputFileName: data.inputFileName ?? null,
        inputFileContent: data.inputFileContent ?? null,
        expectedFileName: data.expectedFileName ?? null,
        expectedFileContent: data.expectedFileContent ?? null,
        paperCode: data.paperCode ? String(data.paperCode).trim().toUpperCase() : null,
        orderIndex: data.orderIndex || 1,
      },
    });
  }

  async updateTestCase(testCaseId: string, data: Partial<CreateTestCaseDto>): Promise<TestCase> {
    const updateData = { ...data };
    if (updateData.paperCode !== undefined) {
      updateData.paperCode = updateData.paperCode
        ? String(updateData.paperCode).trim().toUpperCase()
        : null;
    }
    return this.prisma.testCase.update({
      where: { id: testCaseId },
      data: updateData,
    });
  }

  async deleteTestCase(testCaseId: string): Promise<void> {
    await this.prisma.testCase.delete({
      where: { id: testCaseId },
    });
  }

  async getTestCases(assignmentId: string, includeHidden: boolean = false): Promise<TestCase[]> {
    return this.prisma.testCase.findMany({
      where: {
        assignmentId,
        ...(includeHidden ? {} : { isHidden: false }),
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  // --- Rubrics ---
  async setRubricRules(assignmentId: string, rules: SetRubricRulesDto['rules']): Promise<RubricRule[]> {
    // Delete old rules and insert new ones transactionally
    await this.prisma.$transaction([
      this.prisma.rubricRule.deleteMany({ where: { assignmentId } }),
      this.prisma.rubricRule.createMany({
        data: rules.map((r, index) => ({
          assignmentId,
          criterionName: r.criterionName,
          description: r.description,
          maxPoints: r.maxPoints,
          weight: r.weight || 1.0,
          orderIndex: r.orderIndex || index + 1,
          criterionType: r.criterionType ?? 'GENERAL',
        })),
      }),
    ]);

    return this.getRubricRules(assignmentId);
  }

  async getRubricRules(assignmentId: string): Promise<RubricRule[]> {
    return this.prisma.rubricRule.findMany({
      where: { assignmentId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  // --- Solutions (RAG) ---
  async upsertSolution(assignmentId: string, data: UpsertSolutionDto): Promise<AssignmentSolution> {
    const contentHash = createHash('sha256').update(JSON.stringify({
      sourceCode: data.sourceCode,
      explanation: data.explanation ?? null,
      expectedTimeComplexity: data.expectedTimeComplexity ?? null,
      expectedSpaceComplexity: data.expectedSpaceComplexity ?? null,
      acceptedStrategies: data.acceptedStrategies ?? [],
      algorithmNotes: data.algorithmNotes ?? null,
    }), 'utf8').digest('hex');
    return this.prisma.$transaction(async (transaction) => {
      await transaction.assignmentSolution.updateMany({
        where: { assignmentId, isActive: true },
        data: { isActive: false, activeKey: null },
      });
      return transaction.assignmentSolution.create({
        data: {
          assignmentId,
          activeKey: assignmentId,
          contentHash,
          indexStatus: 'PENDING',
          title: data.title,
          sourceCode: data.sourceCode,
          explanation: data.explanation ?? null,
          expectedTimeComplexity: data.expectedTimeComplexity ?? null,
          expectedSpaceComplexity: data.expectedSpaceComplexity ?? null,
          acceptedStrategies: data.acceptedStrategies ?? [],
          algorithmNotes: data.algorithmNotes ?? null,
          isActive: true,
        },
      });
    });
  }

  async getSolutions(assignmentId: string): Promise<AssignmentSolution[]> {
    return this.prisma.assignmentSolution.findMany({
      where: { assignmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Proctoring & Live Sessions ---
  async getProctoringAssignment(assignmentId: string): Promise<ProctoringAssignmentRecord | null> {
    return this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true,
            _count: { select: { enrollments: true } },
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    studentCode: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { enrolledAt: 'asc' },
            },
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        testCases: {
          select: {
            id: true,
            label: true,
            points: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
              },
            },
            testResults: {
              select: {
                id: true,
                testCaseId: true,
                verdict: true,
                earnedPoints: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
        examAccessGrants: {
          include: { student: { select: { id: true, fullName: true, studentCode: true } } },
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });
  }

  async getAllAssignmentsForProctoring(lecturerId?: string): Promise<ProctoringRoomRecord[]> {
    return this.prisma.assignment.findMany({
      where: lecturerId ? { course: { lecturerId } } : undefined,
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            semester: true,
            _count: {
              select: { enrollments: true },
            },
          },
        },
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        submissions: {
          select: {
            userId: true,
            finalScore: true,
            compileOutput: true,
          },
        },
        _count: {
          select: {
            submissions: true,
            testCases: true,
            examAccessGrants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async finalizeUnsubmittedStudents(assignmentId: string): Promise<number> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: {
        id: true,
        status: true,
        deadline: true,
      },
    });

    if (!assignment) return 0;

    const isExpired =
      assignment.status === 'CLOSED' ||
      assignment.status === 'ARCHIVED' ||
      Date.now() > assignment.deadline.getTime();

    if (!isExpired) return 0;

    // Lấy danh sách sinh viên đã mở ca thi (nhập passcode hợp lệ)
    const accessGrants = await this.prisma.assignmentExamAccess.findMany({
      where: { assignmentId },
      select: { studentId: true },
    });

    if (accessGrants.length === 0) return 0;

    // Lấy danh sách sinh viên đã nộp bài
    const existingSubmissions = await this.prisma.submission.findMany({
      where: { assignmentId },
      select: { userId: true },
    });

    const submittedUserIds = new Set(existingSubmissions.map((s) => s.userId));
    const unsubmittedStudentIds = accessGrants
      .map((g) => g.studentId)
      .filter((studentId) => !submittedUserIds.has(studentId));

    if (unsubmittedStudentIds.length === 0) return 0;

    let createdCount = 0;
    const submittedTime =
      assignment.deadline.getTime() < Date.now() ? assignment.deadline : new Date();

    for (const studentId of unsubmittedStudentIds) {
      try {
        await this.prisma.submission.create({
          data: {
            assignmentId,
            userId: studentId,
            submissionChannel: 'ZIP_UPLOAD',
            status: 'GRADED',
            finalScore: 0.0,
            sandboxScore: 0.0,
            aiScore: 0.0,
            algorithmScore: 0.0,
            cleanCodeScore: 0.0,
            compileSuccess: false,
            compileOutput: 'Hết thời gian làm bài - Không nộp bài thi (0 điểm).',
            submittedAt: submittedTime,
            gradedAt: new Date(),
            attemptNo: 1,
          },
        });
        createdCount++;
      } catch (err) {
        const prismaError = err as { code?: string };
        if (prismaError?.code !== 'P2002') {
          console.error('[finalizeUnsubmittedStudents] Lỗi tạo bài nộp 0 điểm cho SV ' + studentId + ':', err);
        }
      }
    }

    return createdCount;
  }

  
  async publishAllGrades(assignmentId: string): Promise<{ publishedCount: number; averageScore: number }> {
    await this.finalizeUnsubmittedStudents(assignmentId);
    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId },
      select: { id: true, status: true, sandboxScore: true, aiScore: true, finalScore: true },
    });

    let totalScore = 0;
    let publishedCount = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const sub of submissions) {
        let finalScore = sub.finalScore !== null ? Number(sub.finalScore) : null;
        if (finalScore === null) {
          finalScore = Math.min(10, Math.max(0, Number(sub.sandboxScore || 0) + Number(sub.aiScore || 0)));
        }
        totalScore += finalScore;
        publishedCount++;

        await tx.submission.update({
          where: { id: sub.id },
          data: {
            status: 'GRADED',
            finalScore,
            gradedAt: new Date(),
          },
        });
      }

      await tx.gradingRun.updateMany({
        where: {
          submission: { assignmentId },
          status: 'REVIEW_PENDING',
        },
        data: {
          status: 'PUBLISHED',
          reviewedAt: new Date(),
        },
      });
    });

    const averageScore = publishedCount > 0 ? totalScore / publishedCount : 0;
    return { publishedCount, averageScore };
  }

  async clearAutoZeroSubmissions(assignmentId: string): Promise<number> {
    const deleted = await this.prisma.submission.deleteMany({
      where: {
        assignmentId,
        compileOutput: 'Hết thời gian làm bài - Không nộp bài thi (0 điểm).',
      },
    });
    return deleted.count;
  }
}


