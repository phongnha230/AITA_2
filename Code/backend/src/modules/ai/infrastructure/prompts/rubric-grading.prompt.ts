import { RagContext } from '../facades/rag-knowledge.facade.js';

export class RubricGradingPrompt {
  public static buildSystemInstruction(): string {
    return `Bạn là Giám khảo AI chuyên nghiệp (AI Semantic Grader) của hệ thống AITA (FPT University).
Nhiệm vụ của bạn là đánh giá ngữ nghĩa, chất lượng code, độ phức tạp thuật toán và chấm điểm từng tiêu chí Rubric do Giảng viên thiết lập.

QUY TẮC CHẤM ĐIỂM NGHIÊM NGẶT:
1. Đánh giá ĐÚNG THEO BẢNG RUBRIC CỦA GIẢNG VIÊN: Mỗi tiêu chí có điểm tối đa 'maxPoints', bạn cho điểm 'earnedPoints' từ 0 đến maxPoints dựa trên mức độ đáp ứng của sinh viên.
2. Phân tích độ phức tạp Thời gian (Time Complexity: O(1), O(log n), O(n), O(n log n), O(n^2),...) và Không gian (Space Complexity: O(1), O(n),...).
3. Chỉ rõ lý do trừ điểm ngắn gọn, xúc tích, mang tính xây dựng.
4. BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SCHEMA:
{
  "detectedTimeComplexity": "O(n log n)",
  "detectedSpaceComplexity": "O(1)",
  "codeQualityFeedback": "Nhận xét tổng quan về code...",
  "rubricBreakdown": [
    {
      "rubricId": "uuid-cua-rubric",
      "category": "TIME_COMPLEXITY",
      "title": "Tên tiêu chí",
      "earnedPoints": 1.0,
      "maxPoints": 1.0,
      "feedback": "Nhận xét chi tiết..."
    }
  ]
}`;
  }

  public static buildUserPrompt(
    studentCode: string,
    context: RagContext
  ): string {
    const rubricsText = context.rubricRules.length > 0
      ? context.rubricRules
          .map(
            (r, i) =>
              `${i + 1}. [ID: ${r.id}] ${r.criterionName} (Tối đa: ${r.maxPoints}đ, Trọng số: ${r.weight})\n   - Yêu cầu tiêu chí: ${r.description}`
          )
          .join('\n')
      : 'Không có tiêu chí Rubric riêng. Đánh giá chất lượng code chung tối đa 3.0đ.';

    const failedTestsText = context.failedTestCases.length > 0
      ? context.failedTestCases
          .map(
            (tc) =>
              `- Test: ${tc.label} [Tag: ${tc.rationaleTag}] -> Kết quả: ${tc.verdict} (Lỗi: ${tc.diffLog || tc.actualStdout || 'Sai kết quả'})`
          )
          .join('\n')
      : 'Tất cả các Test Case đều chạy thành công trên Sandbox.';

    const solutionText = context.solutionSourceCode
      ? `\n### LỜI GIẢI MẪU CỦA GIẢNG VIÊN ĐỂ THAM KHẢO:\n\`\`\`\n${context.solutionSourceCode}\n\`\`\`\n`
      : '';

    return `### THÔNG TIN BÀI THI:
- Môn học / Môi trường: ${context.environment}
- Tiêu đề: ${context.assignmentTitle}
- Mô tả yêu cầu: ${context.assignmentDescription || 'Theo đề bài'}
${solutionText}
### DANH SÁCH TESTCASE BỊ LỖI KHI CHẠY THỰC TẾ:
${failedTestsText}

### BẢNG TIÊU CHÍ RUBRIC GIẢNG VIÊN YÊU CẦU CHẤM:
${rubricsText}

### MÃ NGUỒN CỦA SINH VIÊN:
\`\`\`
${studentCode}
\`\`\`

Hãy đánh giá và trả về kết quả JSON chuẩn xác.`;
  }
}
