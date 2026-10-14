import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { SourceCollector } from '../../src/modules/ai/application/services/source-collector.service.js';

const temporaryDirectories: string[] = [];

async function createTemporaryDirectory(): Promise<string> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'aita-source-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    fs.rm(directory, { recursive: true, force: true })
  ));
});

describe('SourceCollector', () => {
  it('collects only C, header and Java source files asynchronously', async () => {
    const directory = await createTemporaryDirectory();
    await fs.writeFile(path.join(directory, 'main.c'), 'int main(void) { return 0; }');
    await fs.writeFile(path.join(directory, 'README.md'), 'ignore me');

    const result = await new SourceCollector().collect(directory);
    expect(result.files).toEqual([{ relativePath: 'main.c', bytes: 28 }]);
    expect(result.combinedSource).toContain('int main');
    expect(result.combinedSource).not.toContain('ignore me');
  });

  it('rejects a source file larger than 64 KiB', async () => {
    const directory = await createTemporaryDirectory();
    await fs.writeFile(path.join(directory, 'Main.java'), 'a'.repeat(64 * 1024 + 1));
    await expect(new SourceCollector().collect(directory)).rejects.toMatchObject({
      errorCode: 'INPUT_TOO_LARGE',
    });
  });
});
