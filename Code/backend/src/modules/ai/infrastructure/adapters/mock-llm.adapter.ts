import { ILlmProvider, LlmGenerateOptions, LlmResponse } from './llm-provider.interface.js';

export class MockLlmAdapter implements ILlmProvider {
  async generateContent(prompt: string, options: LlmGenerateOptions): Promise<LlmResponse> {
    if (options.jsonMode) {
      return {
        text: JSON.stringify({
          overallAiScore: 2.5,
          detectedTimeComplexity: 'O(n log n)',
          detectedSpaceComplexity: 'O(1)',
          codeQualityFeedback:
            'Mã nguồn có cấu trúc rõ ràng, đặt tên biến tuân theo camelCase chuẩn, thuật toán tối ưu.',
          rubricBreakdown: [
            {
              rubricId: 'default-rubric-1',
              category: 'TIME_COMPLEXITY',
              title: 'Độ phức tạp thuật toán',
              earnedPoints: 1.5,
              maxPoints: 1.5,
              feedback: 'Thuật toán đạt O(n log n) đúng theo yêu cầu đề bài.',
            },
            {
              rubricId: 'default-rubric-2',
              category: 'CLEAN_CODE',
              title: 'Clean Code & Quy chuẩn đặt tên',
              earnedPoints: 1.0,
              maxPoints: 1.5,
              feedback: 'Code sạch sẽ, cần bổ sung thêm comment giải thích các logic xử lý mảng.',
            },
          ],
        }),
        tokensConsumed: 150,
      };
    }

    return {
      text: 'Chào bạn! Trong bài làm của bạn, hàm tìm kiếm đang duyệt qua từng phần tử. Bạn có thể suy nghĩ xem nếu mảng đã được sắp xếp tăng dần thì có thuật toán nào giúp tìm kiếm nhanh hơn từ O(n) về O(log n) không?',
      tokensConsumed: 60,
    };
  }
}
