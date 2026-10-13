import { ILlmProvider, LlmGenerateOptions, LlmResponse } from './llm-provider.interface.js';

export class MockLlmAdapter implements ILlmProvider {
  async generateContent(prompt: string, options: LlmGenerateOptions): Promise<LlmResponse> {
    if (options.jsonMode) {
      return {
        text: JSON.stringify({
          overallAiScore: 1.8,
          detectedTimeComplexity: 'O(n log n)',
          detectedSpaceComplexity: 'O(1)',
          codeQualityFeedback:
            'Mã nguồn có cấu trúc rõ ràng, đặt tên biến tuân theo camelCase chuẩn, thuật toán tối ưu, không có dấu hiệu hardcode.',
          rubricBreakdown: [
            {
              rubricId: 'default-rubric-1',
              category: 'TIME_COMPLEXITY',
              title: 'Độ phức tạp thuật toán kỳ vọng',
              earnedPoints: 1.0,
              maxPoints: 1.0,
              feedback: 'Thuật toán đạt O(n log n) đúng theo yêu cầu đề bài.',
            },
            {
              rubricId: 'default-rubric-2',
              category: 'CLEAN_CODE',
              title: 'Clean Code & Chống Hardcode mã nguồn',
              earnedPoints: 0.8,
              maxPoints: 1.0,
              feedback: 'Code sạch sẽ, biến đặt tên rõ ràng, hàm xử lý tổng quát.',
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
