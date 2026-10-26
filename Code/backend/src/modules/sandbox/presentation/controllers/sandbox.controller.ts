import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { NextFunction, Request, Response } from 'express';
import { env } from '../../../../infrastructure/config/env.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';
import { AppError, ForbiddenError, ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { ExecuteSandboxInput, InstructorDryRunInput } from '../../application/dtos/sandbox.dto.js';
import { ISandboxService } from '../../application/services/sandbox.service.js';
import { ISandboxRepository } from '../../domain/interfaces/sandbox.repository.interface.js';
import { TestCaseInput } from '../../domain/interfaces/sandbox-runner.interface.js';
import { SandboxRunnerFactory } from '../../infrastructure/sandbox-runner.factory.js';
import { ICourseRepository } from '../../../course/domain/repositories/course.repository.interface.js';

const execFileAsync = promisify(execFile);

export class SandboxController {
  constructor(
    private readonly sandboxService: ISandboxService,
    private readonly sandboxRepository: ISandboxRepository,
    private readonly courseRepository: ICourseRepository
  ) {}

  public health = async (_req: Request, res: Response): Promise<void> => {
    let dockerAvailable = false;
    let playwrightSandboxAvailable = false;
    if (env.USE_DOCKER_SANDBOX) {
      try {
        await execFileAsync('docker', ['version', '--format', '{{.Server.Version}}'], { timeout: 6_000, windowsHide: true });
        dockerAvailable = true;
      } catch {
        dockerAvailable = false;
      }
      if (dockerAvailable) {
        try {
          await execFileAsync('docker', ['image', 'inspect', env.PLAYWRIGHT_SANDBOX_IMAGE], { timeout: 5_000, windowsHide: true });
          await execFileAsync('docker', ['image', 'inspect', env.PLAYWRIGHT_CONTROL_IMAGE], { timeout: 5_000, windowsHide: true });
          await execFileAsync('docker', ['network', 'inspect', env.PLAYWRIGHT_SANDBOX_NETWORK], { timeout: 5_000, windowsHide: true });
          const proxyStatus = await execFileAsync('docker', ['inspect', '--format', '{{.State.Running}}', 'aita-playwright-egress-proxy'], { timeout: 5_000, windowsHide: true });
          playwrightSandboxAvailable = proxyStatus.stdout.trim() === 'true';
        } catch {
          playwrightSandboxAvailable = false;
        }
      }
    }

    res.status(200).json({
      status: dockerAvailable ? 'ready' : 'unavailable',
      dockerAvailable,
      dockerRequired: true,
      playwrightSandboxAvailable,
    });
  };

  public getStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let dockerAvailable = false;
      let playwrightSandboxAvailable = false;
      try {
        await execFileAsync('docker', ['version', '--format', '{{.Server.Version}}'], { timeout: 6_000, windowsHide: true });
        dockerAvailable = true;
      } catch {
        dockerAvailable = false;
      }
      if (dockerAvailable) {
        try {
          await execFileAsync('docker', ['image', 'inspect', env.PLAYWRIGHT_SANDBOX_IMAGE], { timeout: 5_000, windowsHide: true });
          await execFileAsync('docker', ['image', 'inspect', env.PLAYWRIGHT_CONTROL_IMAGE], { timeout: 5_000, windowsHide: true });
          await execFileAsync('docker', ['network', 'inspect', env.PLAYWRIGHT_SANDBOX_NETWORK], { timeout: 5_000, windowsHide: true });
          const proxyStatus = await execFileAsync('docker', ['inspect', '--format', '{{.State.Running}}', 'aita-playwright-egress-proxy'], { timeout: 5_000, windowsHide: true });
          playwrightSandboxAvailable = proxyStatus.stdout.trim() === 'true';
        } catch {
          playwrightSandboxAvailable = false;
        }
      }

      const { activeExecutions, totalGradedCount, failedExecutions } =
        await this.sandboxRepository.getStatusCounts();

      sendSuccess(res, {
        status: dockerAvailable && env.USE_DOCKER_SANDBOX ? 'READY' : 'UNAVAILABLE',
        dockerDaemonRunning: dockerAvailable,
        playwrightSandboxAvailable,
        playwrightSandboxImage: env.PLAYWRIGHT_SANDBOX_IMAGE,
        activeMode: dockerAvailable && env.USE_DOCKER_SANDBOX ? 'DOCKER_ISOLATED' : 'UNAVAILABLE',
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

  public dryRunCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const tempDir = path.resolve(env.WORKSPACE_DIR, `lecturer_dry_run_${crypto.randomUUID()}`);
    try {
      const input = req.body as InstructorDryRunInput;
      if (!env.USE_DOCKER_SANDBOX) {
        throw new AppError('Chạy thử yêu cầu Docker Sandbox; chế độ local-native không được phép.', 503, 'SANDBOX_UNAVAILABLE');
      }
      try {
        await execFileAsync('docker', ['version', '--format', '{{.Server.Version}}'], { timeout: 6_000, windowsHide: true });
      } catch {
        throw new AppError('Docker Sandbox hiện chưa sẵn sàng. Hãy thử lại sau.', 503, 'SANDBOX_UNAVAILABLE');
      }

      const course = await this.courseRepository.findById(input.courseId);
      if (!course) throw new ValidationError('Không tìm thấy khóa học.');
      if (req.user?.role !== 'ADMIN' && course.lecturerId !== req.user?.userId) {
        throw new ForbiddenError('Bạn không có quyền chạy thử đề của khóa học này.');
      }
      if (input.language === 'C_GCC' && input.testCases.some((testCase) => testCase.comparisonMode !== 'STDIO')) {
        throw new ValidationError('Chạy thử C hiện chỉ hỗ trợ testcase STDIO.');
      }
      if (input.language === 'JAVA_JDK' && input.testCases.some(
        (testCase) => testCase.comparisonMode === 'FILE_TO_FILE' && !testCase.expectedFileName
      )) {
        throw new ValidationError('Testcase Java dạng file cần khai báo tên file kết quả.');
      }

      await fs.mkdir(tempDir, { recursive: true });
      const isJava = input.language === 'JAVA_JDK';
      if (input.sourceFiles?.length) {
        let totalSourceBytes = 0;
        for (const sourceFile of input.sourceFiles) {
          const sourcePath = sourceFile.path.replace(/\\/g, '/');
          const segments = sourcePath.split('/');
          const extension = path.posix.extname(sourcePath).toLowerCase();
          const allowedExtensions = isJava ? new Set(['.java']) : new Set(['.c', '.h']);
          if (
            sourcePath.startsWith('/') || /^[a-z]:/i.test(sourcePath)
            || segments.some((segment) => !segment || segment === '.' || segment === '..')
            || /[\0-\x1f]/.test(sourcePath) || !allowedExtensions.has(extension)
          ) {
            throw new ValidationError(`Đường dẫn hoặc loại file mã nguồn không hợp lệ: ${sourceFile.path}`);
          }
          totalSourceBytes += Buffer.byteLength(sourceFile.content, 'utf8');
          if (totalSourceBytes > 1024 * 1024) throw new ValidationError('Tổng mã nguồn không được vượt quá 1 MiB.');
          const absolutePath = path.resolve(tempDir, ...segments);
          if (!absolutePath.startsWith(`${tempDir}${path.sep}`)) throw new ValidationError('Đường dẫn source vượt khỏi thư mục chạy thử.');
          await fs.mkdir(path.dirname(absolutePath), { recursive: true });
          await fs.writeFile(absolutePath, sourceFile.content, { encoding: 'utf8', flag: 'wx' });
        }
      } else {
        await fs.writeFile(path.join(tempDir, isJava ? 'Main.java' : 'main.c'), input.sourceCode!, 'utf8');
      }
      const testCases: TestCaseInput[] = input.testCases.map((testCase, index) => ({
        id: testCase.id ?? `dry-run-${index + 1}`,
        questionNo: testCase.questionNo ?? 'Q1',
        inputData: testCase.comparisonMode === 'FILE_TO_FILE'
          ? testCase.inputFileContent ?? ''
          : testCase.stdinInput ?? '',
        expectedOutput: testCase.comparisonMode === 'FILE_TO_FILE'
          ? testCase.expectedFileContent ?? ''
          : testCase.expectedStdout ?? '',
        outputFileName: testCase.comparisonMode === 'FILE_TO_FILE' ? testCase.expectedFileName : null,
        timeLimitMs: testCase.timeLimitMs,
        memoryLimitMb: Math.ceil(testCase.memoryLimitKb / 1024),
        score: testCase.points,
      }));
      const summary = await SandboxRunnerFactory.createRunner(input.language).execute(tempDir, testCases, { requireDocker: true });
      sendSuccess(res, summary, 'Chạy thử Sandbox hoàn tất.');
    } catch (error) {
      next(error);
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('[SandboxController] Failed to clean lecturer dry-run workspace', {
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
