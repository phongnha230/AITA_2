import { Assignment as PrismaAssignmentModel, AssignmentSolution, PrismaClient, RubricRule, TestCase } from '@prisma/client';
import {
  AssignmentDetailRecord,
  AssignmentListRecord,
  IAssignmentRepository,
  CreateAssignmentData,
  ProctoringAssignmentRecord,
  ProctoringRoomRecord,
} from '../../domain/repositories/assignment.repository.interface.js';
import { Assignment, AssignmentEnv } from '../../domain/entities/assignment.entity.js';
import { createHash } from 'node:crypto';
import { CreateTestCaseDto, SetRubricRulesDto, UpsertSolutionDto } from '../../application/dtos/assignment.dto.js';

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
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      gradingVersion: raw.gradingVersion,
      functionalMaxScore: Number(raw.functionalMaxScore),
      algorithmMaxScore: Number(raw.algorithmMaxScore),
      cleanCodeMaxScore: Number(raw.cleanCodeMaxScore),
    });
  }

  async findById(id: string): Promise<Assignment | null> {
    const raw = await this.prisma.assignment.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
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
        testCases: {
          where: includeHiddenTests ? {} : { isHidden: false },
          orderBy: { orderIndex: 'asc' },
        },
        rubricRules: {
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            submissions: true,
            testCases: true,
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
        _count: {
          select: {
            submissions: true,
            testCases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

