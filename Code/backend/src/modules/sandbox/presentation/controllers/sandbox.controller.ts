import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { NextFunction, Request, Response } from 'express';
import { env } from '../../../../infrastructure/config/env.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { ExecuteSandboxInput } from '../../application/dtos/sandbox.dto.js';
import { ISandboxService } from '../../application/services/sandbox.service.js';
import { ISandboxRepository } from '../../domain/interfaces/sandbox.repository.interface.js';
import { TestCaseInput } from '../../domain/interfaces/sandbox-runner.interface.js';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox-runner.factory.js';

const execFileAsync = promisify(execFile);

export class SandboxController {
  constructor(
    private readonly sandboxService: ISandboxService,
    private readonly sandboxRepository: ISandboxRepository
  ) {}

  public health = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ status: 'ready' });
  };

  public getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let dockerAvailable = false;
      try {
        await execFileAsync('docker', ['info'], { timeout: 3_000 });
        dockerAvailable = true;
      } catch {
        dockerAvailable = false;
      }

      const { activeExecutions, totalGradedCount, failedExecutions } =
        await this.sandboxRepository.getStatusCounts();

      sendSuccess(res, {
        status: 'READY',
        dockerDaemonRunning: dockerAvailable,
        activeMode: dockerAvailable && env.USE_DOCKER_SANDBOX ? 'DOCKER_ISOLATED' : 'LOCAL_NATIVE',
        activeExecutions,
        totalGradedCount,
        failedExecutions,
        limits: {
          minTimeoutMs: 100,
          maxTimeoutMs: 10_000,
          minMemoryMb: 32,
          maxMemoryMb: 512,
          maxTestCases: 100,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public executeCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tempDir = path.resolve(env.WORKSPACE_DIR, `api_test_${crypto.randomUUID()}`);
    try {
      const input = req.body as ExecuteSandboxInput;
      await fs.mkdir(tempDir, { recursive: true });

      const isJava = ['JAVA', 'PRO192', 'CSD201'].includes(input.language);
      const requestedFileName = input.fileName ? path.basename(input.fileName) : '';
      const safeFileName = requestedFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const codeFileName = safeFileName && safeFileName !== '.' && safeFileName !== '..'
        ? safeFileName
        : (isJava ? 'Main.java' : 'main.c');

      await fs.writeFile(path.join(tempDir, codeFileName), input.sourceCode, 'utf8');
      const testCases: TestCaseInput[] = input.testCases.map((testCase, index) => ({
        id: testCase.id ?? `tc-${index + 1}`,
        questionNo: testCase.questionNo ?? 'Q1',
        inputData: testCase.inputData,
        expectedOutput: testCase.expectedOutput,
        outputFileName: testCase.outputFileName ?? null,
        timeLimitMs: testCase.timeLimitMs,
        memoryLimitMb: testCase.memoryLimitMb,
        score: testCase.score,
      }));

      const runner = SandboxRunnerFactory.createRunner(input.language);
      const summary = await runner.execute(tempDir, testCases);
      sendSuccess(res, summary, 'Thực thi kiểm thử Sandbox hoàn tất');
    } catch (error) {
      next(error);
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('[SandboxController] Failed to clean direct-execution workspace', {
          workspaceId: path.basename(tempDir),
          error: cleanupError instanceof Error ? cleanupError.message : 'Unknown cleanup error',
        });
      }
    }
  };

  public gradeSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { submissionId } = req.params;
      if (!submissionId) {
        throw new ValidationError('submissionId là bắt buộc trong URL.');
      }
      const languageOverride = typeof req.body?.languageOverride === 'string'
        ? req.body.languageOverride
        : undefined;
      const summary = await this.sandboxService.gradeSubmission(submissionId, languageOverride);
      sendSuccess(res, summary, `Chấm điểm bài nộp ${submissionId} thành công`);
    } catch (error) {
      next(error);
    }
  };
}
