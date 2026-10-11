import { PrismaClient } from '@prisma/client';
import { IAssignmentRepository, CreateAssignmentData } from '../../domain/repositories/assignment.repository.interface.js';
import { Assignment } from '../../domain/entities/assignment.entity.js';

export class PrismaAssignmentRepository implements IAssignmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): Assignment {
    return new Assignment({
      id: raw.id,
      courseId: raw.courseId,
      title: raw.title,
      description: raw.description,
      environment: raw.environment,
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
    });
  }

  async findById(id: string): Promise<Assignment | null> {
    const raw = await this.prisma.assignment.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findDetailedById(id: string, includeHiddenTests: boolean = false): Promise<any | null> {
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

  async findByCourseId(courseId: string): Promise<any[]> {
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

  async delete(id: string): Promise<void> {
    await this.prisma.assignment.delete({
      where: { id },
    });
  }

  // --- Test Cases ---
  async addTestCase(assignmentId: string, data: any): Promise<any> {
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

  async updateTestCase(testCaseId: string, data: any): Promise<any> {
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

  async getTestCases(assignmentId: string, includeHidden: boolean = false): Promise<any[]> {
    return this.prisma.testCase.findMany({
      where: {
        assignmentId,
        ...(includeHidden ? {} : { isHidden: false }),
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  // --- Rubrics ---
  async setRubricRules(assignmentId: string, rules: any[]): Promise<any[]> {
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
        })),
      }),
    ]);

    return this.getRubricRules(assignmentId);
  }

  async getRubricRules(assignmentId: string): Promise<any[]> {
    return this.prisma.rubricRule.findMany({
      where: { assignmentId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  // --- Solutions (RAG) ---
  async upsertSolution(assignmentId: string, data: any): Promise<any> {
    return this.prisma.assignmentSolution.create({
      data: {
        assignmentId,
        title: data.title,
        sourceCode: data.sourceCode,
        explanation: data.explanation ?? null,
        isActive: true,
      },
    });
  }

  async getSolutions(assignmentId: string): Promise<any[]> {
    return this.prisma.assignmentSolution.findMany({
      where: { assignmentId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
