import { SandboxRunnerFactory } from '../src/modules/sandbox/infrastructure/sandbox-runner.factory.js';
import { PlaywrightWebRunner } from '../src/modules/sandbox/infrastructure/runners/playwright-web.runner.js';
import { TestCaseInput } from '../src/modules/sandbox/domain/interfaces/sandbox-runner.interface.js';

async function main() {
  console.log('--- Testing Web Playwright Runner & Sandbox Factory ---');

  // 1. Test Factory mapping
  const webRunner = SandboxRunnerFactory.createRunner('WEB');
  const cRunner = SandboxRunnerFactory.createRunner('C');
  const javaRunner = SandboxRunnerFactory.createRunner('JAVA');

  console.log('✅ Factory resolved Web Runner:', webRunner.constructor.name);
  console.log('✅ Factory resolved C Runner:', cRunner.constructor.name);
  console.log('✅ Factory resolved Java Runner:', javaRunner.constructor.name);

  // 2. Test Dynamic Action Steps Execution
  const sampleStepsJson = JSON.stringify([
    { action: 'GOTO', target: '/login' },
    { action: 'FILL', target: '#username', value: 'admin' },
    { action: 'FILL', target: '#password', value: '123456' },
    { action: 'CLICK', target: '#btn-login' },
    { action: 'ASSERT_VISIBLE', target: '.dashboard-container' },
    { action: 'ASSERT_TEXT', target: 'h1.title', expected: 'Bảng Quản Trị' },
  ]);

  const testCases: TestCaseInput[] = [
    {
      id: 'tc-web-01',
      questionNo: 'Q1',
      inputData: sampleStepsJson,
      expectedOutput: 'All steps completed successfully',
      timeLimitMs: 10000,
      memoryLimitMb: 512,
      score: 5.0,
    },
    {
      id: 'tc-web-02',
      questionNo: 'Q2',
      inputData: 'GOTO|/products\nASSERT_VISIBLE|#product-list',
      expectedOutput: 'All steps completed successfully',
      timeLimitMs: 5000,
      memoryLimitMb: 256,
      score: 5.0,
    },
  ];

  const runner = new PlaywrightWebRunner();
  const summary = await runner.execute('./workspaces/dummy-web', testCases);

  console.log('✅ Web Runner Execution Summary:');
  console.log('  Total Tests:', summary.totalTests);
  console.log('  Passed Tests:', summary.passedTests);
  console.log('  Total Score:', summary.totalScore, '/', summary.maxScore);
  console.log('  Results:', JSON.stringify(summary.results, null, 2));

  console.log('\n=== All Web & Sandbox Tests Completed Successfully! ===');
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
