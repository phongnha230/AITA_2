import { RubricRuleInput } from '../../types/assignment.types';

export const buildJavaGradingRubric = (
  courseCode: string | null | undefined,
  expectedTimeComplexity: string,
  expectedSpaceComplexity: string
): RubricRuleInput[] => {
  const normalizedCourseCode = courseCode?.trim().toUpperCase();
  const algorithmDescription = normalizedCourseCode === 'CSD201'
    ? `Đánh giá lựa chọn cấu trúc dữ liệu, tính đúng và độ phức tạp thời gian ${expectedTimeComplexity || 'chưa cấu hình'} / bộ nhớ ${expectedSpaceComplexity || 'chưa cấu hình'}; chấp nhận chiến lược tương đương đã nêu, không yêu cầu code giống đáp án.`
    : `Đánh giá chiến lược thuật toán theo độ phức tạp thời gian ${expectedTimeComplexity || 'chưa cấu hình'} và bộ nhớ ${expectedSpaceComplexity || 'chưa cấu hình'}, có xét các cách giải hợp lệ khác đáp án tham chiếu.`;
  const cleanCodeCriterionName = normalizedCourseCode === 'PRO192'
    ? 'Thiết kế OOP & Clean Code'
    : normalizedCourseCode === 'CSD201'
      ? 'Clean Code Java'
      : 'Clean Code & Chống Hardcode mã nguồn';
  const cleanCodeDescription = normalizedCourseCode === 'PRO192'
    ? 'Đánh giá encapsulation, trách nhiệm class/method, cohesion, hợp đồng interface khi đề yêu cầu, naming và xử lý exception/resource; chỉ trừ điểm theo bằng chứng trong source.'
    : normalizedCourseCode === 'CSD201'
      ? 'Đánh giá naming, khả năng đọc hiểu, phân chia hàm hợp lý và xử lý edge case; không yêu cầu thiết kế OOP/inheritance nếu đề không quy định và không hardcode testcase.'
      : 'Cấu trúc mã nguồn rõ ràng, đặt tên biến/hàm phù hợp, xử lý thuật toán tổng quát và tuyệt đối không hardcode kết quả testcase.';

  return [
    {
      criterionName: 'Độ phức tạp thuật toán kỳ vọng',
      description: algorithmDescription,
      maxPoints: 2,
      weight: 1,
      orderIndex: 1,
      criterionType: 'ALGORITHM',
    },
    {
      criterionName: cleanCodeCriterionName,
      description: cleanCodeDescription,
      maxPoints: 1,
      weight: 1,
      orderIndex: 2,
      criterionType: 'CLEAN_CODE',
    },
  ];
};
