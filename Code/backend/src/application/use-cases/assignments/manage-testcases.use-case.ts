import prisma from '../../../infrastructure/database/prisma.client.js';
import { TestType } from '@prisma/client';

export interface TestCaseInput {
  questionNo?: string;
  outputFileName?: string;
  inputData: string;
  expectedOutput: string;
  isHidden?: boolean;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  score?: number;
  rationale?: string;
  testType?: TestType;
}

export class ManageTestCasesUseCase {
  /**
   * Thêm 1 hoặc nhiều testcase vào đề thi (hỗ trợ Bulk Create)
   */
  async addTestCases(assignmentId: string, testCases: TestCaseInput[]) {
    if (!testCases || testCases.length === 0) {
      throw new Error('Danh sách test cases không được để trống');
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error(`Không tìm thấy đề thi với ID: ${assignmentId}`);
    }

    // Chuẩn bị dữ liệu tạo
    const dataToCreate = testCases.map((tc) => ({
      assignmentId,
      questionNo: tc.questionNo ? tc.questionNo.toUpperCase().trim() : 'Q1',
      outputFileName: tc.outputFileName ? tc.outputFileName.trim() : null,
      inputData: tc.inputData ?? '',
      expectedOutput: tc.expectedOutput ?? '',
      isHidden: tc.isHidden !== undefined ? tc.isHidden : false,
      timeLimitMs: tc.timeLimitMs !== undefined ? Number(tc.timeLimitMs) : 2000,
      memoryLimitMb: tc.memoryLimitMb !== undefined ? Number(tc.memoryLimitMb) : 256,
      score: tc.score !== undefined ? tc.score : 1.0,
      rationale: tc.rationale ? tc.rationale.trim() : null,
      testType: tc.testType ?? TestType.BASIC,
    }));

    const result = await prisma.testCase.createMany({
      data: dataToCreate,
    });

    return {
      message: `Đã nạp thành công ${result.count} test cases cho đề thi`,
      count: result.count,
    };
  }

  /**
   * Lấy danh sách testcase của đề thi (hỗ trợ lọc theo câu hỏi Q1..Q4)
   * Phục vụ giảng viên hoặc TV5 Docker Sandbox
   */
  async getTestCases(assignmentId: string, questionNo?: string) {
    const whereClause: any = { assignmentId };
    if (questionNo) {
      whereClause.questionNo = questionNo.toUpperCase().trim();
    }

    const testCases = await prisma.testCase.findMany({
      where: whereClause,
      orderBy: [{ questionNo: 'asc' }, { createdAt: 'asc' }],
    });

    return testCases;
  }

  /**
   * Cập nhật 1 testcase
   */
  async updateTestCase(testCaseId: string, data: Partial<TestCaseInput>) {
    const existing = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!existing) {
      throw new Error(`Không tìm thấy testcase với ID: ${testCaseId}`);
    }

    const updated = await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        questionNo: data.questionNo ? data.questionNo.toUpperCase().trim() : undefined,
        outputFileName: data.outputFileName !== undefined ? data.outputFileName : undefined,
        inputData: data.inputData !== undefined ? data.inputData : undefined,
        expectedOutput: data.expectedOutput !== undefined ? data.expectedOutput : undefined,
        isHidden: data.isHidden !== undefined ? data.isHidden : undefined,
        timeLimitMs: data.timeLimitMs !== undefined ? Number(data.timeLimitMs) : undefined,
        memoryLimitMb: data.memoryLimitMb !== undefined ? Number(data.memoryLimitMb) : undefined,
        score: data.score !== undefined ? data.score : undefined,
        rationale: data.rationale !== undefined ? data.rationale : undefined,
        testType: data.testType !== undefined ? data.testType : undefined,
      },
    });

    return updated;
  }

  /**
   * Xóa 1 testcase
   */
  async deleteTestCase(testCaseId: string) {
    const existing = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!existing) {
      throw new Error(`Không tìm thấy testcase với ID: ${testCaseId}`);
    }

    await prisma.testCase.delete({
      where: { id: testCaseId },
    });

    return { message: 'Đã xóa testcase thành công' };
  }
}

export const manageTestCasesUseCase = new ManageTestCasesUseCase();
