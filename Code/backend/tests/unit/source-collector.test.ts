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

    const result = await new SourceCollector().collect(directory, 'C_GCC');
    expect(result.files).toEqual([{ relativePath: 'main.c', bytes: 28 }]);
    expect(result.combinedSource).toContain('int main');
    expect(result.combinedSource).not.toContain('ignore me');
  });

  it('rejects a source file larger than 64 KiB', async () => {
    const directory = await createTemporaryDirectory();
    await fs.writeFile(path.join(directory, 'Main.java'), 'a'.repeat(64 * 1024 + 1));
    await expect(new SourceCollector().collect(directory, 'JAVA_JDK')).rejects.toMatchObject({
      errorCode: 'INPUT_TOO_LARGE',
    });
  });

  it('rejects more than two hundred source files', async () => {
    const directory = await createTemporaryDirectory();
    await Promise.all(Array.from({ length: 201 }, (_, index) =>
      fs.writeFile(path.join(directory, `file-${index}.c`), 'int value;')
    ));
    await expect(new SourceCollector().collect(directory, 'C_GCC')).rejects.toMatchObject({
      errorCode: 'INPUT_TOO_LARGE',
    });
  });

  it('rejects a total source size larger than one MiB', async () => {
    const directory = await createTemporaryDirectory();
    await Promise.all(Array.from({ length: 17 }, (_, index) =>
      fs.writeFile(path.join(directory, `File${index}.java`), 'a'.repeat(64 * 1024))
    ));
    await expect(new SourceCollector().collect(directory, 'JAVA_JDK')).rejects.toMatchObject({
      errorCode: 'INPUT_TOO_LARGE',
    });
  });

  it('walks nested folders and ignores configured build directories', async () => {
    const directory = await createTemporaryDirectory();
    await fs.mkdir(path.join(directory, 'src'));
    await fs.mkdir(path.join(directory, 'node_modules'));
    await fs.writeFile(path.join(directory, 'src', 'defs.h'), '#define VALUE 1');
    await fs.writeFile(path.join(directory, 'node_modules', 'ignored.c'), 'int ignored;');
    const result = await new SourceCollector().collect(directory, 'C_GCC');
    expect(result.files.map((file) => file.relativePath)).toEqual([path.join('src', 'defs.h')]);
  });

  it('rejects Java files in a C submission instead of silently mixing languages', async () => {
    const directory = await createTemporaryDirectory();
    await fs.writeFile(path.join(directory, 'main.c'), 'int main(void) { return 0; }');
    await fs.writeFile(path.join(directory, 'Main.java'), 'class Main {}');

    await expect(new SourceCollector().collect(directory, 'C_GCC')).rejects.toMatchObject({
      errorCode: 'SOURCE_LANGUAGE_MISMATCH',
    });
  });

  it('rejects C and header files in a Java submission', async () => {
    const directory = await createTemporaryDirectory();
    await fs.writeFile(path.join(directory, 'Main.java'), 'class Main {}');
    await fs.writeFile(path.join(directory, 'main.c'), 'int main(void) { return 0; }');

    await expect(new SourceCollector().collect(directory, 'JAVA_JDK')).rejects.toMatchObject({
      errorCode: 'SOURCE_LANGUAGE_MISMATCH',
    });
  });

  it('skips minified files and lockfiles in C submission', async () => {
    const directory = await createTemporaryDirectory();
    await fs.writeFile(path.join(directory, 'main.c'), 'int main(void) { return 0; }');
    await fs.writeFile(path.join(directory, 'bundle.min.css'), 'body{margin:0}');
    await fs.writeFile(path.join(directory, 'package-lock.json'), '{}');

    const result = await new SourceCollector().collect(directory, 'C_GCC');
    expect(result.files).toEqual([{ relativePath: 'main.c', bytes: 28 }]);
  });

  it('collects React source files according to priority budget, ignoring tests, assets, and lockfiles', async () => {
    const directory = await createTemporaryDirectory();
    await fs.mkdir(path.join(directory, 'src', 'components'), { recursive: true });
    await fs.mkdir(path.join(directory, 'src', '__tests__'), { recursive: true });
    await fs.mkdir(path.join(directory, 'public'), { recursive: true });

    await fs.writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'react-app' }));
    await fs.writeFile(path.join(directory, 'src', 'main.tsx'), 'import React from "react";');
    await fs.writeFile(path.join(directory, 'src', 'components', 'Button.tsx'), 'export const Button = () => <button />;');
    await fs.writeFile(path.join(directory, 'src', 'styles.css'), 'body { background: white; }');
    await fs.writeFile(path.join(directory, 'src', 'App.test.tsx'), 'test("ignored", () => {});');
    await fs.writeFile(path.join(directory, 'src', 'Button.stories.tsx'), 'export default {};');
    await fs.writeFile(path.join(directory, 'src', 'types.d.ts'), 'declare module "x";');
    await fs.writeFile(path.join(directory, 'src', 'bundle.min.js'), 'function min(){};');
    await fs.writeFile(path.join(directory, 'package-lock.json'), '{}');
    await fs.writeFile(path.join(directory, 'public', 'favicon.ico'), 'icon');
    await fs.writeFile(path.join(directory, 'src', '__tests__', 'helper.ts'), 'export const h = 1;');

    const result = await new SourceCollector().collect(directory, 'REACT_JS');

    expect(result.selectionStrategy).toBe('REACT_PRIORITY_BUDGET');
    expect(result.omittedFileCount).toBe(0);
    const paths = result.files.map((file) => file.relativePath.replace(/\\/g, '/'));
    expect(paths).toEqual([
      'package.json',
      'src/main.tsx',
      'src/components/Button.tsx',
      'src/styles.css',
    ]);
    expect(result.combinedSource).toContain('// [AITA_REACT_SOURCE_SELECTION]');
    expect(result.combinedSource).toContain('// [REPOSITORY_FILE_MANIFEST]');
    expect(result.combinedSource).not.toContain('App.test.tsx');
  });

  it('truncates React files larger than 32 KiB with a bounded review notice', async () => {
    const directory = await createTemporaryDirectory();
    const largeContent = 'const x = "a";\n'.repeat(2500); // > 32 KiB
    await fs.writeFile(path.join(directory, 'package.json'), '{}');
    await fs.writeFile(path.join(directory, 'App.tsx'), largeContent);

    const result = await new SourceCollector().collect(directory, 'REACT_JS');
    expect(result.combinedSource).toContain('File truncated after 32768 bytes');
  });

  it('enforces maximum candidate files limit for React projects', async () => {
    const directory = await createTemporaryDirectory();
    await Promise.all(Array.from({ length: 2_001 }, (_, index) =>
      fs.writeFile(path.join(directory, `Component${index}.jsx`), 'export const C = () => null;')
    ));

    await expect(new SourceCollector().collect(directory, 'REACT_JS')).rejects.toMatchObject({
      errorCode: 'INPUT_TOO_LARGE',
    });
  });

  it('caps React selection budget and tracks omitted file count', async () => {
    const directory = await createTemporaryDirectory();
    await Promise.all(Array.from({ length: 30 }, (_, index) =>
      fs.writeFile(path.join(directory, `Comp${index}.tsx`), `export const Comp${index} = () => null;`)
    ));

    const result = await new SourceCollector().collect(directory, 'REACT_JS');
    expect(result.files.length).toBeLessThanOrEqual(24);
    expect(result.omittedFileCount).toBeGreaterThan(0);
    expect(result.combinedSource).toContain(`Omitted from prompt: ${result.omittedFileCount} candidate files`);
  });
});
