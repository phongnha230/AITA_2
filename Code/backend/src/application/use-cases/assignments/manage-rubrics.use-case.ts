import prisma from '../../../infrastructure/database/prisma.client.js';

export interface RubricRuleInput {
  name: string;
  description?: string;
  maxScore?: number;
  weightPercent: number;
  promptInstruction: string;
  orderIndex?: number;
}

export interface SolutionInput {
  questionNo: string;
  solutionCode: string;
  explanationNotes: string;
  complexityExpected?: string;
}

export class ManageRubricsUseCase {
  /**
   * Cấu hình danh sách Rubric Rules cho đề thi
   */
  async setRubricRules(assignmentId: string, rules: RubricRuleInput[]) {
    if (!rules || rules.length === 0) {
      throw new Error('Danh sách rubric rules không được để trống');
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error(`Không tìm thấy đề thi với ID: ${assignmentId}`);
    }

    // Kiểm tra tổng trọng số không vượt quá 100%
    const totalWeight = rules.reduce((sum, r) => sum + Number(r.weightPercent || 0), 0);
    if (totalWeight > 100) {
      throw new Error(`Tổng trọng số các tiêu chí rubric là ${totalWeight}%, vượt quá 100%`);
    }

    // Xóa bộ rules cũ và nạp bộ mới theo chuẩn atomic transaction
    await prisma.$transaction(async (tx) => {
      await tx.rubricRule.deleteMany({
        where: { assignmentId },
      });

      const rulesData = rules.map((r, index) => ({
        assignmentId,
        name: r.name.trim(),
        description: r.description,
        maxScore: r.maxScore !== undefined ? r.maxScore : 2.0,
        weightPercent: r.weightPercent,
        promptInstruction: r.promptInstruction.trim(),
        orderIndex: r.orderIndex !== undefined ? r.orderIndex : index + 1,
      }));

      await tx.rubricRule.createMany({
        data: rulesData,
      });
    });

    return {
      message: `Đã cấu hình thành công ${rules.length} tiêu chí rubric cho đề thi`,
      totalWeight,
    };
  }

  /**
   * Lấy danh sách Rubric Rules của đề thi (phục vụ TV6 RAG AI Grader)
   */
  async getRubricRules(assignmentId: string) {
    const rules = await prisma.rubricRule.findMany({
      where: { assignmentId },
      orderBy: { orderIndex: 'asc' },
    });

    return rules;
  }

  /**
   * Nạp hoặc cập nhật Đáp án mẫu (Model Solution) cho đề thi (phục vụ TV6 lưu ChromaDB)
   */
  async upsertSolution(assignmentId: string, input: SolutionInput) {
    if (!input.questionNo || !input.solutionCode || !input.explanationNotes) {
      throw new Error('Câu hỏi (questionNo), mã nguồn mẫu (solutionCode) và giải thích (explanationNotes) là bắt buộc');
    }

    const qNo = input.questionNo.toUpperCase().trim();

    // Tìm xem đã có solution cho questionNo này chưa
    const existing = await prisma.assignmentSolution.findFirst({
      where: {
        assignmentId,
        questionNo: qNo,
      },
    });

    if (existing) {
      const updated = await prisma.assignmentSolution.update({
        where: { id: existing.id },
        data: {
          solutionCode: input.solutionCode,
          explanationNotes: input.explanationNotes,
          complexityExpected: input.complexityExpected,
        },
      });
      return updated;
    } else {
      const created = await prisma.assignmentSolution.create({
        data: {
          assignmentId,
          questionNo: qNo,
          solutionCode: input.solutionCode,
          explanationNotes: input.explanationNotes,
          complexityExpected: input.complexityExpected,
        },
      });
      return created;
    }
  }

  /**
   * Lấy danh sách đáp án mẫu của đề thi
   */
  async getSolutions(assignmentId: string) {
    const solutions = await prisma.assignmentSolution.findMany({
      where: { assignmentId },
      orderBy: { questionNo: 'asc' },
    });

    return solutions;
  }
}

export const manageRubricsUseCase = new ManageRubricsUseCase();
