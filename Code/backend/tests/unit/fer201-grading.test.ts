import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { SourceCollector } from '../../src/modules/ai/application/services/source-collector.service.js';
import { RubricGradingPrompt } from '../../src/modules/ai/infrastructure/prompts/rubric-grading.prompt.js';
import { aggregateGradingScores } from '../../src/infrastructure/queue/grading-score.service.js';
import { isPrivateNetworkAddress, parseDeploymentUrl } from '../../src/modules/submission/infrastructure/storage/deployed-url.validator.js';
import type { RagContext } from '../../src/modules/ai/application/services/rag-knowledge.service.interface.js';
import { parseWebTestScript } from '../../src/modules/sandbox/domain/web-test-script.js';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

describe('FER201 grading', () => {
  it('aggregates the full 7 + 2 + 1 grading scale', () => {
    expect(aggregateGradingScores(
      { sandboxScore: 8, aiScore: 99, algorithmScore: 3, cleanCodeScore: 2 },
      { gradingVersion: 2, functionalMaxScore: 7, algorithmMaxScore: 2, cleanCodeMaxScore: 1 }
    )).toEqual({ sandboxScore: 7, aiScore: 3, algorithmScore: 2, cleanCodeScore: 1, finalScore: 10 });
  });

  it('collects React source and excludes generated output', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'aita-react-'));
    temporaryDirectories.push(directory);
    await fs.mkdir(path.join(directory, 'src'));
    await fs.mkdir(path.join(directory, 'dist'));
    await fs.writeFile(path.join(directory, 'src', 'App.tsx'), 'export const App = () => <main>Hello</main>;');
    await fs.writeFile(path.join(directory, 'src', 'app.scss'), 'main { color: blue; }');
    await fs.writeFile(path.join(directory, 'dist', 'bundle.js'), 'generated');
    const result = await new SourceCollector().collect(directory, 'REACT_JS');
    expect(result.files.map((file) => file.relativePath).sort()).toEqual([
      path.join('src', 'App.tsx'),
      path.join('src', 'app.scss'),
    ].sort());
  });

  it('selects a bounded, architecture-first subset instead of reading an entire React repository', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'aita-react-large-'));
    temporaryDirectories.push(directory);
    await fs.mkdir(path.join(directory, 'src', 'components'), { recursive: true });
    await fs.mkdir(path.join(directory, 'src', 'context'), { recursive: true });
    await fs.writeFile(path.join(directory, 'package.json'), '{"dependencies":{"react":"18"}}');
    await fs.writeFile(path.join(directory, 'src', 'App.tsx'), 'export const App = () => <main />;');
    await fs.writeFile(path.join(directory, 'src', 'context', 'AuthContext.tsx'), 'export const AuthContext = {};');
    await Promise.all(Array.from({ length: 35 }, (_, index) =>
      fs.writeFile(
        path.join(directory, 'src', 'components', `Component${index}.tsx`),
        `export const Component${index} = () => <div>${'x'.repeat(6_000)}</div>;`
      )
    ));

    const result = await new SourceCollector().collect(directory, 'REACT_JS');
    expect(result.selectionStrategy).toBe('REACT_PRIORITY_BUDGET');
    expect(result.files.length).toBeLessThanOrEqual(24);
    expect(result.totalBytes).toBeLessThanOrEqual(128 * 1024);
    expect(result.omittedFileCount).toBeGreaterThan(0);
    expect(result.combinedSource).toContain(path.join('src', 'App.tsx'));
    expect(result.combinedSource).toContain('AuthContext.tsx');
    expect(result.combinedSource).toContain('[REPOSITORY_FILE_MANIFEST]');
  });

  it('uses the React semantic grading strategy', () => {
    const context: RagContext = {
      assignmentTitle: 'React project',
      assignmentDescription: null,
      environment: 'REACT_JS',
      courseCode: null,
      javaGradingProfile: null,
      algorithmSpecification: { expectedTimeComplexity: null, expectedSpaceComplexity: null, acceptedStrategies: [], notes: null },
      referenceSolutionSource: '',
      relevantSolutionChunks: [],
      rubricRules: [{ id: 'react', criterionName: 'Hooks', description: 'Use hooks correctly', maxPoints: 2, weight: 1, criterionType: 'ALGORITHM' }],
      failedTestCases: [],
      testPerformance: [],
    };
    expect(RubricGradingPrompt.buildSystemInstruction('REACT_JS')).toContain('React/TypeScript');
    expect(RubricGradingPrompt.buildUserPrompt('useState(0)', context)).toContain('<UNTRUSTED_REACT_SOURCE>');
  });

  it('rejects local/private deploy targets and custom ports', () => {
    expect(() => parseDeploymentUrl('http://example.com')).toThrow();
    expect(() => parseDeploymentUrl('https://localhost')).toThrow();
    expect(() => parseDeploymentUrl('https://example.com:8443')).toThrow();
    expect(isPrivateNetworkAddress('127.0.0.1')).toBe(true);
    expect(isPrivateNetworkAddress('192.168.1.5')).toBe(true);
    expect(isPrivateNetworkAddress('8.8.8.8')).toBe(false);
  });

  it('requires an explicit and structurally valid Playwright scenario', () => {
    expect(() => parseWebTestScript('')).toThrow('JSON hợp lệ');
    expect(() => parseWebTestScript('{"version":1,"steps":[]}')).toThrow('ít nhất một bước');
    expect(() => parseWebTestScript(JSON.stringify({
      version: 1,
      steps: [{ action: 'FILL', target: 'input[name="email"]' }],
    }))).toThrow('thiếu giá trị');

    expect(parseWebTestScript(JSON.stringify({
      version: 1,
      steps: [
        { action: 'GOTO', target: '/login', timeoutMs: 15_000 },
        { action: 'FILL', target: 'input[name="email"]', value: 'student@example.com' },
        { action: 'CLICK', target: 'button[type="submit"]' },
        { action: 'ASSERT_URL', expected: '/dashboard' },
      ],
    }))).toHaveLength(4);
  });
});
