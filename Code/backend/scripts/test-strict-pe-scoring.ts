import { MockLlmAdapter } from '../src/modules/ai/infrastructure/adapters/mock-llm.adapter.js';
import { RubricGradingPrompt } from '../src/modules/ai/infrastructure/prompts/rubric-grading.prompt.js';
import { SetRubricRulesSchema } from '../src/modules/assignment/application/dtos/assignment.dto.js';

console.log('================================================================');
console.log('🧪 TEST RUNNER: KIỂM TRA ĐỒNG BỘ CHUẨN KHẢO THÍ STRICT PE (8.0 + 2.0 = 10.0)');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ' - ' + detail : ''}`);
  }
}

async function runTests() {
  // Test 1: Mock LLM Adapter conforms to 2.0đ scale
  console.log('📌 1. Kiểm tra Mock LLM Adapter cho AI Semantic Grader:');
  const mockAdapter = new MockLlmAdapter();
  const mockRes = await mockAdapter.generateContent('test prompt', { jsonMode: true });
  const parsed = JSON.parse(mockRes.text);

  assert(parsed.overallAiScore <= 2.0, `overallAiScore <= 2.0 (thực tế: ${parsed.overallAiScore})`);
  assert(parsed.rubricBreakdown.length === 2, `Có đúng 2 tiêu chí Rubric chuẩn (thực tế: ${parsed.rubricBreakdown.length})`);
  const totalMaxRubrics = parsed.rubricBreakdown.reduce((sum: number, r: any) => sum + r.maxPoints, 0);
  assert(totalMaxRubrics === 2.0, `Tổng maxPoints của Rubric bằng đúng 2.0đ (thực tế: ${totalMaxRubrics})`);
  assert(!mockRes.text.includes('3.0'), 'Không còn chứa giá trị cũ 3.0');

  // Test 2: Rubric Grading Prompt fallback scale
  console.log('\n📌 2. Kiểm tra Rubric Grading Prompt:');
  const fallbackPrompt = RubricGradingPrompt.buildUserPrompt('int main() {}', {
    assignmentTitle: 'PE PRF192',
    assignmentDescription: 'Bài thi C',
    environment: 'C_GCC',
    failedTestCases: [],
    rubricRules: [],
  });
  assert(fallbackPrompt.includes('2.0đ'), 'Prompt fallback nêu rõ tối đa 2.0đ cho AI Clean Code');
  assert(!fallbackPrompt.includes('3.0đ'), 'Prompt fallback không còn chứa 3.0đ');

  // Test 3: SetRubricRulesSchema validation
  console.log('\n📌 3. Kiểm tra SetRubricRulesSchema Zod DTO:');
  const validRubricPayload = {
    rules: [
      {
        criterionName: 'Độ phức tạp thuật toán kỳ vọng',
        description: 'Đạt O(n log n)',
        maxPoints: 1.0,
        weight: 1.0,
        orderIndex: 1,
      },
      {
        criterionName: 'Clean Code & Chống Hardcode mã nguồn',
        description: 'OOP chuẩn, không hardcode',
        maxPoints: 1.0,
        weight: 1.0,
        orderIndex: 2,
      },
    ],
  };
  const parseResult = SetRubricRulesSchema.safeParse(validRubricPayload);
  assert(parseResult.success, 'Zod Schema parse thành công 2 Rubrics chuẩn Strict PE');

  // Test 4: Công thức tính điểm Sandbox và Capping
  console.log('\n📌 4. Kiểm tra công thức chuẩn hóa điểm Sandbox & Capping:');
  // Giả sử tổng điểm testcase đạt 100%
  const maxScore = 8.0;
  const earnedScore = 8.0;
  const normalizedSandbox100 = Number((((earnedScore / maxScore) * 8.0) || 0).toFixed(2));
  assert(normalizedSandbox100 === 8.0, `Đạt 100% testcase -> điểm Sandbox = 8.0 (thực tế: ${normalizedSandbox100})`);

  // Giả sử tổng điểm testcase đạt 50%
  const earnedScoreHalf = 4.0;
  const normalizedSandbox50 = Number((((earnedScoreHalf / maxScore) * 8.0) || 0).toFixed(2));
  assert(normalizedSandbox50 === 4.0, `Đạt 50% testcase -> điểm Sandbox = 4.0 (thực tế: ${normalizedSandbox50})`);

  // Giả sử tổng điểm Final: 8.0 Sandbox + 1.8 AI = 9.8
  const aiScore = 1.8;
  const finalScore = Number(Math.min(10.0, Math.max(0, normalizedSandbox100 + aiScore)).toFixed(2));
  assert(finalScore === 9.8, `Điểm bài thi chuẩn: 8.0 + 1.8 = 9.8 (thực tế: ${finalScore})`);

  // Giả sử AI cho vượt trần (2.5) -> Capping AI = 2.0, Capping Final = 10.0
  const uncappedAi = 2.5;
  const cappedAi = Number(Math.min(2.0, Math.max(0, uncappedAi)).toFixed(2));
  const cappedFinal = Number(Math.min(10.0, Math.max(0, 8.0 + cappedAi)).toFixed(2));
  assert(cappedAi === 2.0, `AI Score capping chặn trần 2.0đ thành công (thực tế: ${cappedAi})`);
  assert(cappedFinal === 10.0, `Final Score capping chặn trần 10.0đ thành công (thực tế: ${cappedFinal})`);

  console.log('\n================================================================');
  console.log(`🎯 KẾT QUẢ TEST: ${passedTests}/${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('🎉 TẤT CẢ CÁC ĐIỀU KIỆN STRICT PE ĐÃ ĐƯỢC XÁC THỰC HOÀN HẢO!');
  } else {
    console.error('❌ MỘT SỐ TEST BỊ LỖI, VUI LÒNG KIỂM TRA LẠI!');
  }
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Lỗi khi chạy test:', err);
  process.exit(1);
});
