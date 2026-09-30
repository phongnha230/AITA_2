export type TestExecutionStatus =
  | "PASSED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR"
  | "FILE_NOT_FOUND";

export interface TestCaseInput {
  id: string;
  questionNo: string; // 'Q1', 'Q2', 'Q3', 'Q4'
  inputData: string; // Dữ liệu đầu vào bơm vào stdin hoặc ghi ra data.txt
  expectedOutput: string; // Dữ liệu đầu ra chuẩn của giảng viên
  outputFileName?: string | null; // Ví dụ: 'f1.txt' (dành cho môn CSD201)
  timeLimitMs: number; // Giới hạn thời gian (mặc định 2000ms = 2s)
  memoryLimitMb: number; // Giới hạn RAM (mặc định 256MB)
  score: number; // Điểm của testcase
}

export interface TestCaseResult {
  testCaseId: string;
  questionNo: string;
  passed: boolean;
  status: TestExecutionStatus;
  actualOutput: string;
  expectedOutput: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  errorMessage?: string | null;
}

export interface SandboxExecutionSummary {
  success: boolean;
  compileError?: string | null;
  totalTests: number;
  passedTests: number;
  totalScore: number;
  maxScore: number;
  results: TestCaseResult[];
}

export interface ISandboxRunner {
  /**
   * Biên dịch và chạy toàn bộ testcases cho bài nộp
   * @param stagedFolderPath Đường dẫn thư mục code sạch đã giải nén
   * @param testCases Danh sách testcases
   */
  execute(
    stagedFolderPath: string,
    testCases: TestCaseInput[],
  ): Promise<SandboxExecutionSummary>;
}
