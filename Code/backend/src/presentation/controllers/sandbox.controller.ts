import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import env from '../../infrastructure/config/env.js';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox/sandbox-runner.factory.js';
import { SandboxService } from '../../infrastructure/sandbox/services/sandbox.service.js';
import { TestCaseInput } from '../../infrastructure/sandbox/interfaces/sandbox-runner.interface.js';

const execAsync = promisify(exec);

export class SandboxController {
  /**
   * GET /api/v1/sandbox/status
   * Kiểm tra tình trạng môi trường Sandbox (Docker, Compilers)
   */
  public static async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let dockerAvailable = false;
      try {
        await execAsync('docker ps', { timeout: 3000 });
        dockerAvailable = true;
      } catch {
        dockerAvailable = false;
      }

      let javaVersion = 'NOT_FOUND';
      try {
        const { stdout, stderr } = await execAsync('javac -version', { timeout: 3000 });
        javaVersion = stdout.trim() || stderr.trim();
      } catch {
        javaVersion = 'NOT_INSTALLED';
      }

      res.status(200).json({
        success: true,
        message: 'Sandbox Execution Engine Status',
        data: {
          status: 'READY',
          useDockerSandboxConfig: env.USE_DOCKER_SANDBOX,
          dockerDaemonRunning: dockerAvailable,
          activeMode: dockerAvailable && env.USE_DOCKER_SANDBOX ? 'DOCKER_ISOLATED' : 'LOCAL_NATIVE',
          localJavaVersion: javaVersion,
          supportedLanguages: ['C', 'CPP', 'PRF192', 'JAVA', 'PRO192', 'CSD201'],
          limits: {
            defaultTimeoutMs: 2000,
            defaultMemoryLimitMb: 256,
            networkIsolation: true,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/sandbox/execute
   * Chạy trực tiếp mã nguồn gửi qua request body để test sandbox
   */
  public static async executeCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tempDir = path.resolve(env.WORKSPACE_DIR, `api_test_${crypto.randomUUID()}`);
    try {
      const { language = 'JAVA', sourceCode, fileName, testCases } = req.body;

      if (!sourceCode || typeof sourceCode !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Trường sourceCode (mã nguồn) là bắt buộc và phải là chuỗi.',
        });
        return;
      }

      if (!Array.isArray(testCases) || testCases.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Trường testCases là bắt buộc và phải là mảng không rỗng.',
        });
        return;
      }

      // 1. Tạo thư mục tạm thời gian thực
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 2. Lưu file mã nguồn
      const langUpper = (language as string).toUpperCase();
      let codeFileName = fileName;
      if (!codeFileName) {
        if (['JAVA', 'PRO192', 'CSD201'].includes(langUpper)) {
          codeFileName = 'Main.java';
        } else {
          codeFileName = 'main.c';
        }
      }

      fs.writeFileSync(path.join(tempDir, codeFileName), sourceCode, 'utf-8');

      // 3. Chuẩn hóa testcases
      const formattedTestCases: TestCaseInput[] = testCases.map((tc: any, index: number) => ({
        id: tc.id || `tc-${index + 1}`,
        questionNo: tc.questionNo || 'Q1',
        inputData: tc.inputData ?? '',
        expectedOutput: tc.expectedOutput ?? '',
        outputFileName: tc.outputFileName ?? null,
        timeLimitMs: Number(tc.timeLimitMs) || 2000,
        memoryLimitMb: Number(tc.memoryLimitMb) || 256,
        score: Number(tc.score) || 1.0,
      }));

      // 4. Khởi tạo Runner qua Factory và thực thi
      const runner = SandboxRunnerFactory.createRunner(language);
      const summary = await runner.execute(tempDir, formattedTestCases);

      res.status(200).json({
        success: true,
        message: 'Thực thi kiểm thử Sandbox hoàn tất',
        data: summary,
      });
    } catch (error: any) {
      next(error);
    } finally {
      // Dọn dẹp thư mục tạm
      if (fs.existsSync(tempDir)) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }

  /**
   * POST /api/v1/sandbox/grade/:submissionId
   * Chấm điểm bài nộp theo ID trong CSDL
   */
  public static async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { submissionId } = req.params;
      const { languageOverride } = req.body;

      if (!submissionId) {
        res.status(400).json({
          success: false,
          message: 'submissionId là bắt buộc trong URL.',
        });
        return;
      }

      const summary = await SandboxService.gradeSubmission(submissionId, languageOverride);

      res.status(200).json({
        success: true,
        message: `Chấm điểm bài nộp ${submissionId} thành công`,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
