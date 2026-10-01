import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { env } from '../../../../infrastructure/config/env.js';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox-runner.factory.js';
import { SandboxService } from '../../application/services/sandbox.service.js';
import { TestCaseInput } from '../../domain/interfaces/sandbox-runner.interface.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const execAsync = promisify(exec);

export class SandboxController {
  /**
   * GET /api/v1/sandbox/status
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

      sendSuccess(
        res,
        {
          status: 'READY',
          useDockerSandboxConfig: env.USE_DOCKER_SANDBOX,
          dockerDaemonRunning: dockerAvailable,
          activeMode:
            dockerAvailable && env.USE_DOCKER_SANDBOX ? 'DOCKER_ISOLATED' : 'LOCAL_NATIVE',
          localJavaVersion: javaVersion,
          supportedLanguages: ['C', 'CPP', 'PRF192', 'JAVA', 'PRO192', 'CSD201'],
          limits: {
            defaultTimeoutMs: 2000,
            defaultMemoryLimitMb: 256,
            networkIsolation: true,
          },
        },
        'Sandbox Execution Engine Status'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/sandbox/execute
   */
  public static async executeCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    const tempDir = path.resolve(env.WORKSPACE_DIR, `api_test_${crypto.randomUUID()}`);
    try {
      const { language = 'JAVA', sourceCode, fileName, testCases } = req.body;

      if (!sourceCode || typeof sourceCode !== 'string') {
        throw new ValidationError('Trường sourceCode (mã nguồn) là bắt buộc và phải là chuỗi.');
      }

      if (!Array.isArray(testCases) || testCases.length === 0) {
        throw new ValidationError('Trường testCases là bắt buộc và phải là mảng không rỗng.');
      }

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

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

      const runner = SandboxRunnerFactory.createRunner(language);
      const summary = await runner.execute(tempDir, formattedTestCases);

      sendSuccess(res, summary, 'Thực thi kiểm thử Sandbox hoàn tất');
    } catch (error: any) {
      next(error);
    } finally {
      if (fs.existsSync(tempDir)) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    }
  }

  /**
   * POST /api/v1/sandbox/grade/:submissionId
   */
  public static async gradeSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { submissionId } = req.params;
      const { languageOverride } = req.body;

      if (!submissionId) {
        throw new ValidationError('submissionId là bắt buộc trong URL.');
      }

      const summary = await SandboxService.gradeSubmission(submissionId, languageOverride);
      sendSuccess(res, summary, `Chấm điểm bài nộp ${submissionId} thành công`);
    } catch (error) {
      next(error);
    }
  }
}
