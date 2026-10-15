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

  it('rejects more than two hundred source files', async () => {
    const directory = await createTemporaryDirectory();
    await Promise.all(Array.from({ length: 201 }, (_, index) =>
      fs.writeFile(path.join(directory, `file-${index}.c`), 'int value;')
    ));
    await expect(new SourceCollector().collect(directory)).rejects.toMatchObject({
      errorCode: 'INPUT_TOO_LARGE',
    });
  });

  it('rejects a total source size larger than one MiB', async () => {
    const directory = await createTemporaryDirectory();
    await Promise.all(Array.from({ length: 17 }, (_, index) =>
      fs.writeFile(path.join(directory, `File${index}.java`), 'a'.repeat(64 * 1024))
    ));
    await expect(new SourceCollector().collect(directory)).rejects.toMatchObject({
      errorCode: 'INPUT_TOO_LARGE',
    });
  });

  it('walks nested folders and ignores configured build directories', async () => {
    const directory = await createTemporaryDirectory();
    await fs.mkdir(path.join(directory, 'src'));
    await fs.mkdir(path.join(directory, 'node_modules'));
    await fs.writeFile(path.join(directory, 'src', 'defs.h'), '#define VALUE 1');
    await fs.writeFile(path.join(directory, 'node_modules', 'ignored.c'), 'int ignored;');
    const result = await new SourceCollector().collect(directory);
    expect(result.files.map((file) => file.relativePath)).toEqual([path.join('src', 'defs.h')]);
  });
});
