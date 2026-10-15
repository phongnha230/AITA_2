import {
  ISandboxRunner,
  TestCaseInput,
  TestCaseResult,
  SandboxExecutionSummary,
} from '../../domain/interfaces/sandbox-runner.interface.js';
import { validatePublicDeploymentUrl } from '../../../submission/infrastructure/storage/deployed-url.validator.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
import { parseWebTestScript, WebActionStep } from '../../domain/web-test-script.js';

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
  newContext(options: Record<string, unknown>): Promise<{
    newPage(): Promise<PageLike>;
    route(pattern: string, handler: (route: RouteLike) => Promise<void>): Promise<void>;
    close(): Promise<void>;
  }>;
  close(): Promise<void>;
}

interface RouteLike {
  request(): { url(): string };
  continue(): Promise<void>;
  abort(errorCode?: string): Promise<void>;
}

interface ChromiumLike {
  launch(options: Record<string, unknown>): Promise<BrowserLike>;
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
    await this.assertReachable(targetBaseUrl);

    // 2. Thử load thư viện Playwright (nếu đã cài đặt)
    let playwrightChromium: ChromiumLike;
    try {
      const playwrightModule = await import('playwright') as unknown as { chromium?: ChromiumLike };
      if (!playwrightModule.chromium) throw new Error('Playwright Chromium API không khả dụng.');
      playwrightChromium = playwrightModule.chromium;
      const probe = await playwrightChromium.launch({ headless: true });
      await probe.close();
    } catch (error) {
      logger.error('playwright_runtime_unavailable', { stage: 'PLAYWRIGHT_BOOT', error });
      throw new Error('[PlaywrightWebRunner] Chromium chưa được cài đặt hoặc không thể khởi động.');
    }

    for (const tc of testCases) {
      const startTime = Date.now();
      const steps = this.parseTestCaseSteps(tc.inputData);

      const tcResult = await this.runRealBrowserSteps(
        playwrightChromium,
        tc,
        steps,
        targetBaseUrl,
        startTime
      );
      results.push(tcResult);
      if (tcResult.passed) {
        totalScore += tc.score || 0;
      }
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

  private async assertReachable(initialUrl: string): Promise<void> {
    let currentUrl = initialUrl;
    for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
      currentUrl = await validatePublicDeploymentUrl(currentUrl);
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(15_000),
        headers: { 'user-agent': 'AITA-FER201-Grader/1.0' },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) throw new Error('Deploy URL redirect nhưng không có Location header.');
        await response.body?.cancel();
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }
      if (!response.ok) throw new Error(`Deploy URL trả về HTTP ${response.status}.`);
      await response.body?.cancel();
      return;
    }
    throw new Error('Deploy URL redirect quá 5 lần.');
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
    chromium: ChromiumLike,
    tc: TestCaseInput,
    steps: WebActionStep[],
    baseUrl: string,
    startTime: number
  ): Promise<TestCaseResult> {
    let browser: BrowserLike | null = null;
    const logs: string[] = [];

    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
      const validatedOrigins = new Set<string>();
      await context.route('**/*', async (route) => {
        const requestUrl = route.request().url();
        try {
          const parsed = new URL(requestUrl);
          if (!validatedOrigins.has(parsed.origin)) {
            await validatePublicDeploymentUrl(requestUrl);
            validatedOrigins.add(parsed.origin);
          }
          await route.continue();
        } catch (error) {
          logs.push(`[SSRF] Blocked resource ${requestUrl}: ${error instanceof Error ? error.message : String(error)}`);
          await route.abort('blockedbyclient');
        }
      });
      const page = await context.newPage();

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
      if (browser) {
        await browser.close();
      }
    }
  }

}
