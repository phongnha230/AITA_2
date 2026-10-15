import { RagContext } from '../facades/rag-knowledge.facade.js';

export class RubricGradingPrompt {
  public static buildSystemInstruction(): string {
    return `Bạn là Giám khảo AI chuyên nghiệp (AI Semantic Grader) của hệ thống AITA (FPT University).
Nhiệm vụ của bạn là:
1. ĐỐI CHIẾU THỰC NGHIỆM: Phân tích nguyên nhân gốc rễ (Root Cause) vì sao các testcase bị FAILED trên Sandbox dựa vào đoạn code đáp án chuẩn được truy xuất từ ChromaDB. Chỉ rõ số dòng (line number) bị lỗi trong bài làm của sinh viên.
2. KIỂM ĐỊNH CLEAN CODE (Clean Code Audit): Chỉ ra đích danh dòng code nào chưa Clean (vi phạm DRY, đặt tên xấu, hàm quá dài, thiếu xử lý biên null/memory leak con trỏ trong C, Scanner trong Java).
3. ĐÁNH GIÁ THEO RUBRIC: Chấm điểm từng tiêu chí Rubric do Giảng viên thiết lập.

BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SCHEMA:
{
  "detectedTimeComplexity": "O(n log n)",
  "detectedSpaceComplexity": "O(1)",
  "codeQualityFeedback": "Nhận xét tổng quan về mã nguồn...",
  "rootCauseAnalysis": [
    {
      "failedTestLabel": "Test 1",
      "errorLine": 24,
      "reason": "Giải thích chi tiết tại sao sai kết quả so với đáp án chuẩn..."
    }
  ],
  "cleanCodeAudit": [
    {
      "line": 15,
      "severity": "WARNING",
      "issue": "Đặt tên biến 'temp1' không mang ý nghĩa ngữ cảnh.",
      "suggestion": "Đổi thành 'currentIndex' hoặc 'studentId'."
    }
  ],
  "rubricBreakdown": [
    {
      "rubricId": "uuid-cua-rubric",
      "category": "CLEAN_CODE",
      "title": "Tên tiêu chí",
      "earnedPoints": 1.0,
      "maxPoints": 1.0,
      "feedback": "Nhận xét cụ thể tiêu chí này..."
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
      : 'Không có tiêu chí Rubric riêng. Đánh giá chất lượng code chung tối đa 2.0đ (Chuẩn khảo thí Strict PE).';

    const failedTestsText = context.failedTestCases.length > 0
      ? context.failedTestCases
          .map(
            (tc) =>
              `- Test: ${tc.label} [Tag: ${tc.rationaleTag}] -> Kết quả: ${tc.verdict} (Lỗi: ${tc.diffLog || tc.actualStdout || 'Sai kết quả'})`
          )
          .join('\n')
      : 'Tất cả các Test Case đều chạy thành công trên Sandbox.';

    let solutionText = '';
    if (context.relevantSolutionChunks && context.relevantSolutionChunks.length > 0) {
      solutionText = `\n### ĐOẠN MÃ ĐÁP ÁN CHUẨN ĐƯỢC TRUY XUẤT TỪ CHROMADB (RAG CHUNKS):\n` +
        context.relevantSolutionChunks
          .map((chunk) => `// [Function/Method: ${chunk.name}]\n${chunk.code}`)
          .join('\n\n') + '\n';
    } else if (context.solutionSourceCode) {
      solutionText = `\n### LỜI GIẢI MẪU CỦA GIẢNG VIÊN ĐỂ THAM KHẢO:\n\`\`\`\n${context.solutionSourceCode}\n\`\`\`\n`;
    }

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
