import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import {
  ISandboxRunner,
  TestCaseInput,
  TestCaseResult,
  SandboxExecutionSummary,
} from '../../domain/interfaces/sandbox-runner.interface.js';
import { validatePublicDeploymentUrl } from '../../../submission/infrastructure/storage/deployed-url.validator.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
import { parseWebTestScript, WebActionStep } from '../../domain/web-test-script.js';
import { env } from '../../../../infrastructure/config/env.js';

const execFileAsync = promisify(execFile);

interface PageLike {
  goto(url: string, options: Record<string, unknown>): Promise<unknown>;
  fill(target: string, value: string, options: Record<string, unknown>): Promise<unknown>;
  click(target: string, options: Record<string, unknown>): Promise<unknown>;
  selectOption(target: string, value: string, options: Record<string, unknown>): Promise<unknown>;
  check(target: string, options: Record<string, unknown>): Promise<unknown>;
  uncheck(target: string, options: Record<string, unknown>): Promise<unknown>;
  press(target: string, value: string, options: Record<string, unknown>): Promise<unknown>;
  keyboard: { press(value: string): Promise<unknown> };
  waitForSelector(target: string, options: Record<string, unknown>): Promise<unknown>;
  waitForTimeout(milliseconds: number): Promise<unknown>;
  isVisible(target: string, options: Record<string, unknown>): Promise<boolean>;
  innerText(target: string, options: Record<string, unknown>): Promise<string>;
  inputValue(target: string, options: Record<string, unknown>): Promise<string>;
  url(): string;
}

interface BrowserLike {
  newContext(options: Record<string, unknown>): Promise<BrowserContextLike>;
  close(): Promise<void>;
}

interface BrowserContextLike {
  newPage(): Promise<PageLike>;
  route(pattern: string, handler: (route: RouteLike) => Promise<void>): Promise<void>;
  routeWebSocket(pattern: string, handler: (route: WebSocketRouteLike) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}

interface RouteLike {
  request(): { url(): string };
  continue(): Promise<void>;
  abort(errorCode?: string): Promise<void>;
}

interface WebSocketRouteLike {
  url(): string;
  connectToServer(): Promise<void>;
  close(): Promise<void>;
}

interface ChromiumLike {
  connect(endpoint: string, options?: Record<string, unknown>): Promise<BrowserLike>;
}

export class PlaywrightWebRunner implements ISandboxRunner {
  /**
   * Chạy kịch bản kiểm thử Web / Vercel tự động
   * @param stagedFolderPath Thư mục chứa mã nguồn hoặc file metadata cấu hình (url, target)
   * @param testCases Danh sách test cases (chứa chuỗi JSON các bước kịch bản)
   */
  public async execute(
    _stagedFolderPath: string,
    testCases: TestCaseInput[],
    context?: { targetBaseUrl?: string }
  ): Promise<SandboxExecutionSummary> {
    const results: TestCaseResult[] = [];
    let totalScore = 0;
    const maxScore = testCases.reduce((sum, tc) => sum + (tc.score || 0), 0);

    if (!context?.targetBaseUrl) {
      throw new Error('[PlaywrightWebRunner] Submission không có deployedUrl snapshot.');
    }
    const targetBaseUrl = await validatePublicDeploymentUrl(context.targetBaseUrl);

    if (!env.USE_DOCKER_SANDBOX) {
      throw new Error('[PlaywrightWebRunner] Chấm React/Web yêu cầu Docker Sandbox; không chạy Chromium trực tiếp trên backend.');
    }

    let playwrightChromium: ChromiumLike;
    try {
      const playwrightModule = await import('playwright') as unknown as { chromium?: ChromiumLike };
      if (!playwrightModule.chromium) throw new Error('Playwright Chromium API không khả dụng.');
      playwrightChromium = playwrightModule.chromium;
    } catch (error) {
      logger.error('playwright_runtime_unavailable', { stage: 'PLAYWRIGHT_BOOT', error });
      throw new Error('[PlaywrightWebRunner] Thư viện Playwright chưa sẵn sàng trên backend.');
    }

    const parsedCases = testCases.map((testCase) => ({
      testCase,
      steps: this.parseTestCaseSteps(testCase.inputData),
    }));
    const browserSession = await this.startIsolatedBrowser(playwrightChromium);
    try {
      for (const { testCase, steps } of parsedCases) {
        const startTime = Date.now();
        const tcResult = await this.runRealBrowserSteps(
          browserSession.browser,
          testCase,
          steps,
          targetBaseUrl,
          startTime
        );
        results.push(tcResult);
        if (tcResult.passed) {
          totalScore += testCase.score || 0;
        }
      }
    } finally {
      await browserSession.close();
    }

    const passedCount = results.filter((r) => r.passed).length;

    return {
      success: true,
      totalTests: testCases.length,
      passedTests: passedCount,
      totalScore: Number(totalScore.toFixed(2)),
      maxScore: Number(maxScore.toFixed(2)),
      results,
    };
  }

  private async startIsolatedBrowser(chromium: ChromiumLike): Promise<{
    browser: BrowserLike;
    close: () => Promise<void>;
  }> {
    const containerName = `aita-playwright-${randomUUID()}`;
    let containerId: string | undefined;
    let controlContainerId: string | undefined;

    try {
      const runResult = await execFileAsync('docker', [
        'run', '--detach', '--rm', '--name', containerName,
        '--network', env.PLAYWRIGHT_SANDBOX_NETWORK,
        '--user', 'pwuser',
        '--cpus', '1',
        '--memory', '1g',
        '--pids-limit', '128',
        '--cap-drop', 'ALL',
        '--security-opt', 'no-new-privileges',
        '--read-only',
        '--tmpfs', '/tmp:rw,nosuid,size=128m',
        '--tmpfs', '/home/pwuser/.cache:rw,nosuid,size=64m',
        '--shm-size', '256m',
        env.PLAYWRIGHT_SANDBOX_IMAGE,
      ], { timeout: 15_000, windowsHide: true });
      containerId = runResult.stdout.trim();
      if (!containerId) throw new Error('Docker không trả về container ID cho Chromium.');

      const endpoint = await this.waitForBrowserEndpoint(containerId);
      const controlResult = await execFileAsync('docker', [
        'run', '--detach', '--rm', '--name', `${containerName}-control`,
        '--network', 'bridge',
        '--publish', '127.0.0.1::3001',
        '--user', 'control',
        '--memory', '64m',
        '--pids-limit', '32',
        '--cap-drop', 'ALL',
        '--security-opt', 'no-new-privileges',
        '--read-only',
        env.PLAYWRIGHT_CONTROL_IMAGE,
        'TCP-LISTEN:3001,fork,reuseaddr,bind=0.0.0.0',
        `TCP:${containerName}:3000`,
      ], { timeout: 15_000, windowsHide: true });
      controlContainerId = controlResult.stdout.trim();
      if (!controlContainerId) throw new Error('Docker không trả về container ID cho kênh điều khiển Chromium.');
      await execFileAsync('docker', ['network', 'connect', env.PLAYWRIGHT_SANDBOX_NETWORK, controlContainerId], {
        timeout: 5_000,
        windowsHide: true,
      });

      const port = await this.waitForPublishedPort(controlContainerId);
      const endpointUrl = new URL(endpoint);
      endpointUrl.hostname = '127.0.0.1';
      endpointUrl.port = String(port);
      const browser = await chromium.connect(endpointUrl.toString(), { timeout: 10_000 });

      return {
        browser,
        close: async () => {
          try {
            await browser.close();
          } finally {
            await this.removeBrowserContainer(controlContainerId!);
            await this.removeBrowserContainer(containerId!);
          }
        },
      };
    } catch (error) {
      if (controlContainerId) await this.removeBrowserContainer(controlContainerId);
      if (containerId) await this.removeBrowserContainer(containerId);
      logger.error('playwright_docker_start_failed', {
        stage: 'PLAYWRIGHT_DOCKER_BOOT',
        browserImage: env.PLAYWRIGHT_SANDBOX_IMAGE,
        controlImage: env.PLAYWRIGHT_CONTROL_IMAGE,
        error,
      });
      throw new Error(
        '[PlaywrightWebRunner] Không thể khởi chạy Chromium trong Docker. Kiểm tra Docker daemon, image sandbox và proxy egress.'
      );
    }
  }

  private async waitForBrowserEndpoint(containerId: string): Promise<string> {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const [logs, state] = await Promise.all([
        execFileAsync('docker', ['logs', containerId], { timeout: 3_000, windowsHide: true })
          .then(({ stdout, stderr }) => `${stdout}\n${stderr}`)
          .catch(() => ''),
        execFileAsync('docker', ['inspect', '--format', '{{.State.Running}}', containerId], {
          timeout: 3_000,
          windowsHide: true,
        }).then(({ stdout }) => stdout.trim() === 'true').catch(() => false),
      ]);
      const endpoint = logs.match(/PLAYWRIGHT_WS_ENDPOINT=(ws:\/\/\S+)/)?.[1];
      if (endpoint) return endpoint;
      if (!state) throw new Error(`Chromium container exited before becoming ready: ${logs.slice(-2000)}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error('Timed out waiting for the Chromium container to become ready.');
  }

  private async waitForPublishedPort(containerId: string): Promise<number> {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const portOutput = await execFileAsync('docker', ['port', containerId, '3001/tcp'], {
        timeout: 3_000,
        windowsHide: true,
      }).then(({ stdout }) => stdout.trim()).catch(() => '');
      const port = Number(portOutput.match(/:(\d+)\s*$/)?.[1]);
      if (Number.isInteger(port) && port > 0) return port;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Docker did not publish the Chromium control port.');
  }

  private async removeBrowserContainer(containerId: string): Promise<void> {
    try {
      await execFileAsync('docker', ['rm', '--force', containerId], { timeout: 5_000, windowsHide: true });
    } catch (error) {
      logger.warn('playwright_docker_cleanup_failed', {
        stage: 'PLAYWRIGHT_DOCKER_CLEANUP',
        containerId,
        error,
      });
    }
  }

  /**
   * Parse kịch bản JSON do giảng viên cấu hình. Dữ liệu rỗng hoặc sai cấu trúc phải fail-closed.
   */
  private parseTestCaseSteps(inputData: string): WebActionStep[] {
    return parseWebTestScript(inputData);
  }

  /**
   * Chạy kịch bản với Playwright Chromium thật
   */
  private async runRealBrowserSteps(
    browser: BrowserLike,
    tc: TestCaseInput,
    steps: WebActionStep[],
    baseUrl: string,
    startTime: number
  ): Promise<TestCaseResult> {
    let browserContext: BrowserContextLike | null = null;
    const logs: string[] = [];

    try {
      browserContext = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        serviceWorkers: 'block',
      });
      await browserContext.route('**/*', async (route) => {
        const requestUrl = route.request().url();
        try {
          await validatePublicDeploymentUrl(requestUrl);
          await route.continue();
        } catch (error) {
          logs.push(`[SSRF] Blocked resource ${requestUrl}: ${error instanceof Error ? error.message : String(error)}`);
          await route.abort('blockedbyclient');
        }
      });
      await browserContext.routeWebSocket('**/*', async (route) => {
        try {
          const socketUrl = new URL(route.url());
          if (socketUrl.protocol !== 'wss:') throw new Error('Only secure WebSockets are allowed.');
          await validatePublicDeploymentUrl(`https://${socketUrl.host}/`);
          await route.connectToServer();
        } catch (error) {
          logs.push(`[SSRF] Blocked WebSocket ${route.url()}: ${error instanceof Error ? error.message : String(error)}`);
          await route.close();
        }
      });
      const page = await browserContext.newPage();

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepTimeout = step.timeoutMs || 10000;

        switch (step.action) {
          case 'GOTO': {
            const url = step.target?.startsWith('http')
              ? step.target
              : new URL(step.target || '/', baseUrl).toString();
            await validatePublicDeploymentUrl(url);
            if (new URL(url).origin !== new URL(baseUrl).origin) {
              throw new Error('Bước GOTO chỉ được điều hướng trong cùng origin với URL deploy.');
            }
            logs.push(`[Step ${i + 1}] Navigate to ${url}`);
            // Cold start resilience: timeout 15000ms
            await page.goto(url, { timeout: Math.max(stepTimeout, 15000), waitUntil: 'domcontentloaded' });
            break;
          }

          case 'FILL': {
            logs.push(`[Step ${i + 1}] Fill selector "${step.target}" with [REDACTED]`);
            await page.fill(step.target!, step.value || '', { timeout: stepTimeout });
            break;
          }

          case 'CLICK': {
            logs.push(`[Step ${i + 1}] Click selector "${step.target}"`);
            await page.click(step.target!, { timeout: stepTimeout });
            break;
          }

          case 'SELECT': {
            logs.push(`[Step ${i + 1}] Select option "${step.value}" in "${step.target}"`);
            await page.selectOption(step.target!, step.value || '', { timeout: stepTimeout });
            break;
          }

          case 'CHECK': {
            logs.push(`[Step ${i + 1}] Check checkbox/radio "${step.target}"`);
            await page.check(step.target!, { timeout: stepTimeout });
            break;
          }

          case 'UNCHECK': {
            logs.push(`[Step ${i + 1}] Uncheck checkbox "${step.target}"`);
            await page.uncheck(step.target!, { timeout: stepTimeout });
            break;
          }

          case 'PRESS_KEY': {
            logs.push(`[Step ${i + 1}] Press key "${step.value}" on "${step.target}"`);
            if (step.target) {
              await page.press(step.target, step.value || 'Enter', { timeout: stepTimeout });
            } else {
              await page.keyboard.press(step.value || 'Enter');
            }
            break;
          }

          case 'WAIT_FOR': {
            logs.push(`[Step ${i + 1}] Wait for selector "${step.target}"`);
            await page.waitForSelector(step.target!, { timeout: stepTimeout });
            break;
          }

          case 'WAIT_FOR_TIMEOUT': {
            const ms = parseInt(step.value || '1000', 10) || 1000;
            logs.push(`[Step ${i + 1}] Wait for ${ms}ms`);
            await page.waitForTimeout(ms);
            break;
          }

          case 'ASSERT_VISIBLE': {
            logs.push(`[Step ${i + 1}] Assert visible: "${step.target}"`);
            const isVisible = await page.isVisible(step.target!, { timeout: stepTimeout });
            if (!isVisible) {
              throw new Error(`Element "${step.target}" was not visible on the page`);
            }
            break;
          }

          case 'ASSERT_TEXT': {
            logs.push(`[Step ${i + 1}] Assert text in "${step.target}" contains "${step.expected}"`);
            const text = await page.innerText(step.target!, { timeout: stepTimeout });
            if (!text.includes(step.expected || '')) {
              throw new Error(
                `Expected text "${step.expected}" in "${step.target}", but found: "${text}"`
              );
            }
            break;
          }

          case 'ASSERT_VALUE': {
            logs.push(`[Step ${i + 1}] Assert input value in "${step.target}" contains "${step.expected}"`);
            const val = await page.inputValue(step.target!, { timeout: stepTimeout });
            if (!val.includes(step.expected || '')) {
              throw new Error(
                `Expected input value "${step.expected}" in "${step.target}", but found: "${val}"`
              );
            }
            break;
          }

          case 'ASSERT_URL': {
            logs.push(`[Step ${i + 1}] Assert current URL contains "${step.expected}"`);
            const currentUrl = page.url();
            if (!currentUrl.includes(step.expected || '')) {
              throw new Error(`Expected URL to contain "${step.expected}", but was: "${currentUrl}"`);
            }
            break;
          }
        }
      }

      const executionTimeMs = Date.now() - startTime;

      return {
        testCaseId: tc.id,
        questionNo: tc.questionNo,
        passed: true,
        status: 'PASSED',
        actualOutput: logs.join('\n').slice(0, 16_000),
        expectedOutput: tc.expectedOutput || 'All steps completed successfully',
        executionTimeMs,
        memoryUsedKb: 45000,
      };
    } catch (error: unknown) {
      const executionTimeMs = Date.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);
      logs.push(`Step Failed: ${message}`);

      return {
        testCaseId: tc.id,
        questionNo: tc.questionNo,
        passed: false,
        status: 'WRONG_ANSWER',
        actualOutput: logs.join('\n').slice(0, 16_000),
        expectedOutput: tc.expectedOutput || 'All steps completed successfully',
        executionTimeMs,
        memoryUsedKb: 30000,
        errorMessage: message,
      };
    } finally {
      if (browserContext) {
        await browserContext.close();
      }
    }
  }

}
