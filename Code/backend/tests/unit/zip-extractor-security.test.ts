import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import AdmZip from 'adm-zip';
import { afterEach, describe, expect, it } from 'vitest';
import { WorkspaceService } from '../../src/modules/submission/infrastructure/storage/workspace.service.js';
import {
  isZipSymbolicLink,
  validateZipEntryPath,
  ZipExtractorService,
} from '../../src/modules/submission/infrastructure/storage/zip-extractor.service.js';
import { ValidationError } from '../../src/shared/domain/exceptions/app.error.js';

const temporaryRoots: string[] = [];

const createFixture = async (): Promise<{
  root: string;
  zipPath: string;
  workspace: WorkspaceService;
}> => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'aita-zip-test-'));
  temporaryRoots.push(root);
  return {
    root,
    zipPath: path.join(root, 'submission.zip'),
    workspace: new WorkspaceService(path.join(root, 'workspaces')),
  };
};

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
});

describe('ZipExtractorService security limits', () => {
  it.each([
    '../main.c',
    '/etc/passwd',
    'C:\\Windows\\system.ini',
    `${Array.from({ length: 21 }, (_, index) => `d${index}`).join('/')}/main.c`,
  ])('rejects unsafe archive paths: %s', (entryPath) => {
    expect(() => validateZipEntryPath(entryPath)).toThrow(ValidationError);
  });

  it('detects Unix symbolic-link entries', () => {
    expect(isZipSymbolicLink(0o120777 << 16)).toBe(true);
    expect(isZipSymbolicLink(0o100644 << 16)).toBe(false);
  });

  it('streams a valid C submission into its isolated workspace', async () => {
    const fixture = await createFixture();
    const archive = new AdmZip();
    archive.addFile('main.c', Buffer.from('int main(void) { return 0; }'));
    archive.writeZip(fixture.zipPath);
    const service = new ZipExtractorService(fixture.workspace);

    const result = await service.extractAndStage(fixture.zipPath, 'submission-valid', 1024);

    expect(result.structureType).toBe('C_SINGLE_FILE');
    await expect(fs.readFile(path.join(result.stagedPath, 'main.c'), 'utf8')).resolves.toContain('main');
  });

  it('rejects an archive whose extracted bytes exceed the assignment limit and cleans staging', async () => {
    const fixture = await createFixture();
    const archive = new AdmZip();
    archive.addFile('main.c', Buffer.alloc(2_048, 65));
    archive.writeZip(fixture.zipPath);
    const service = new ZipExtractorService(fixture.workspace);

    await expect(
      service.extractAndStage(fixture.zipPath, 'submission-large', 1_024)
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(fs.stat(fixture.workspace.getWorkspacePath('submission-large'))).rejects.toThrow();
  });

  it('rejects a high-compression-ratio archive and cleans staging', async () => {
    const fixture = await createFixture();
    const archive = new AdmZip();
    archive.addFile('main.c', Buffer.alloc(200_000, 65));
    archive.writeZip(fixture.zipPath);
    const service = new ZipExtractorService(fixture.workspace);

    await expect(
      service.extractAndStage(fixture.zipPath, 'submission-bomb', 500_000)
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(fs.stat(fixture.workspace.getWorkspacePath('submission-bomb'))).rejects.toThrow();
  });

  it('rejects paths deeper than twenty levels', async () => {
    const fixture = await createFixture();
    const archive = new AdmZip();
    archive.addFile(`${Array.from({ length: 21 }, (_, index) => `d${index}`).join('/')}/main.c`, Buffer.from('x'));
    archive.writeZip(fixture.zipPath);
    const service = new ZipExtractorService(fixture.workspace);

    await expect(
      service.extractAndStage(fixture.zipPath, 'submission-deep', 10_000)
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects archives with more than five thousand entries and cleans staging', async () => {
    const fixture = await createFixture();
    const archive = new AdmZip();
    for (let index = 0; index < 5_001; index += 1) {
      archive.addFile(`file-${index}.c`, Buffer.alloc(0));
    }
    archive.writeZip(fixture.zipPath);
    const service = new ZipExtractorService(fixture.workspace);

    await expect(
      service.extractAndStage(fixture.zipPath, 'submission-many', 10_000)
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(fs.stat(fixture.workspace.getWorkspacePath('submission-many'))).rejects.toThrow();
  }, 15_000);
});
