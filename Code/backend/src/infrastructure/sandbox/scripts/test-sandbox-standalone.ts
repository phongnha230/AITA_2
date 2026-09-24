import * as fs from "fs";
import * as path from "path";
import { SandboxRunnerFactory } from "../sandbox-runner.factory";
import { TestCaseInput } from "../interfaces/sandbox-runner.interface";

async function main() {
  console.log("🧪 BẮT ĐẦU KIỂM THỬ STANDALONE DOCKER SANDBOX ENGINE (C & JAVA)...");

  const tempDir = path.resolve(__dirname, "../../../workspaces/test_c_sample");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  // 1. Tạo file C mẫu (tính tổng 2 số)
  const cCode = `
#include <stdio.h>
int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        printf("%d\\n", a + b);
    }
    return 0;
}
  `;
  fs.writeFileSync(path.join(tempDir, "main.c"), cCode.trim());

  // 2. Tạo testcases mẫu
  const mockTestCases: TestCaseInput[] = [
    {
      id: "tc-01",
      questionNo: "Q1",
      inputData: "5 10",
      expectedOutput: "15",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      score: 5.0,
    },
    {
      id: "tc-02",
      questionNo: "Q1",
      inputData: "100 200",
      expectedOutput: "300",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      score: 5.0,
    },
  ];

  // 3. Chạy qua Factory
  console.log("🚀 Đang khởi chạy CDockerRunner qua SandboxRunnerFactory...");
  const runner = SandboxRunnerFactory.createRunner("C");
  const result = await runner.execute(tempDir, mockTestCases);

  console.log("\n📊 KẾT QUẢ TEST SANDBOX:");
  console.log(`- Thành công: ${result.success}`);
  if (result.compileError) {
    console.log(`- Lỗi biên dịch: ${result.compileError}`);
  }
  console.log(`- Đạt: ${result.passedTests}/${result.totalTests} testcases`);
  console.log(`- Tổng điểm: ${result.totalScore}/${result.maxScore}`);
  console.log("Chi tiết:", JSON.stringify(result.results, null, 2));

  // Dọn dẹp
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("\n✅ ĐÃ HOÀN TẤT KIỂM THỬ SANDBOX THÀNH CÔNG!");
}

main().catch(console.error);
