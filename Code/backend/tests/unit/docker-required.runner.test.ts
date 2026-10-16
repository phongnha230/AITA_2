import { afterEach, describe, expect, it } from 'vitest';
import { env } from '../../src/infrastructure/config/env.js';
import { CDockerRunner } from '../../src/modules/sandbox/infrastructure/runners/c-docker.runner.js';
import { JavaDockerRunner } from '../../src/modules/sandbox/infrastructure/runners/java-docker.runner.js';

const originalDockerSetting = env.USE_DOCKER_SANDBOX;

afterEach(() => {
  env.USE_DOCKER_SANDBOX = originalDockerSetting;
});

describe('C/Java grading Docker isolation', () => {
  it.each([
    ['C', new CDockerRunner()],
    ['Java', new JavaDockerRunner()],
  ])('rejects %s execution when Docker is disabled before attempting native execution', async (_language, runner) => {
    env.USE_DOCKER_SANDBOX = false;

    await expect(runner.execute('path-that-must-not-be-read', [], { requireDocker: true }))
      .rejects.toThrow('Docker Sandbox is unavailable');
  });
});
