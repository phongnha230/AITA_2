import { RagContext } from '../../application/services/rag-knowledge.service.interface.js';

export interface GradingPromptStrategy {
  buildSystemInstruction(strictLeakageMode?: boolean): string;
  buildUserPrompt(studentCode: string, context: RagContext): string;
}

export const buildRubricPayload = (context: RagContext) =>
  context.rubricRules.map((rule) => ({
    rubricId: rule.id,
    criterionName: rule.criterionName,
    description: rule.description,
    maxPoints: rule.maxPoints,
    weight: rule.weight,
    criterionType: rule.criterionType,
  }));

export const buildRetrievedChunksPayload = (context: RagContext) =>
  context.relevantSolutionChunks.map((chunk) => ({
    chunkId: chunk.id,
    chunkType: chunk.chunkType,
    symbol: chunk.symbol,
    similarity: chunk.similarity,
    source: chunk.code,
  }));

export const buildAlgorithmSpecificationPayload = (context: RagContext) => ({
  expectedTimeComplexity: context.algorithmSpecification.expectedTimeComplexity,
  expectedSpaceComplexity: context.algorithmSpecification.expectedSpaceComplexity,
  acceptedStrategies: context.algorithmSpecification.acceptedStrategies,
  notes: context.algorithmSpecification.notes,
});

export const buildTestPerformancePayload = (context: RagContext) => context.testPerformance.map((test) => ({
  label: test.label,
  rationaleTag: test.rationaleTag,
  verdict: test.verdict,
  executionTimeMs: test.executionTimeMs,
  memoryUsedKb: test.memoryUsedKb,
}));

export const buildCommonOutputContract = (oopProfile = false): string[] => [
  'Không tiết lộ, sao chép hoặc tái tạo lời giải tham chiếu. Chỉ nêu nhận xét ngắn và gợi ý khái niệm.',
  oopProfile
    ? 'Chấm theo rubric PRO192 về thiết kế hướng đối tượng. Chỉ đánh giá độ phức tạp thuật toán khi rubric/đề bài yêu cầu rõ; các hướng giải được chấp nhận là gợi ý, không bắt buộc code giống tham chiếu.'
    : 'Đánh giá thuật toán theo độ phức tạp kỳ vọng và các chiến lược được chấp nhận. Lời giải tương đương hợp lệ vẫn đạt điểm dù không giống code tham chiếu.',
  'Nếu có đáp án tham chiếu, nêu ngắn gọn cách tiếp cận và khác biệt có ý nghĩa trong answerComparison; không yêu cầu code giống mẫu và không chép lại đáp án.',
  'Chỉ trả JSON đúng schema, không markdown:',
  '{"answerComparison":"text","rubricBreakdown":[{"rubricId":"id","earnedPoints":0,"feedback":"text"}],"detectedTimeComplexity":"O(n)","detectedSpaceComplexity":"O(1)","codeQualityFeedback":"text"}',
  'Không tự tạo rubricId. Không trả maxPoints hoặc tổng điểm; backend sẽ tự tính.',
];

export const buildStrictLeakageInstruction = (strictLeakageMode: boolean): string =>
  strictLeakageMode
    ? 'CẢNH BÁO: Phản hồi trước đã giống lời giải tham chiếu. Không xuất code block và không dùng lại chuỗi mã nguồn từ context.'
    : '';
