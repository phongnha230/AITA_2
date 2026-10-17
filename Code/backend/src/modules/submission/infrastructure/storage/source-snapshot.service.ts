import AdmZip from 'adm-zip';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { env } from '../../../../infrastructure/config/env.js';

export interface SourceSnapshot {
  path: string;
  sha256: string;
}

export const createSourceSnapshot = async (submissionId: string, sourcePath: string): Promise<SourceSnapshot> => {
  const directory = path.resolve(env.UPLOAD_DIR, 'grading-sources');
  const archivePath = path.join(directory, `${submissionId}.zip`);
  await fs.mkdir(directory, { recursive: true });
  const archive = new AdmZip();
  archive.addLocalFolder(sourcePath);
  archive.writeZip(archivePath);
  await fs.chmod(archivePath, 0o600);
  const bytes = await fs.readFile(archivePath);
  return { path: archivePath, sha256: createHash('sha256').update(bytes).digest('hex') };
};

export const restoreSourceSnapshot = async (snapshotPath: string, destinationPath: string, expectedSha256?: string | null): Promise<void> => {
  const zipPath = path.resolve(snapshotPath);
  if (expectedSha256) {
    const digest = createHash('sha256').update(await fs.readFile(zipPath)).digest('hex');
    if (digest !== expectedSha256) throw new Error('Bản lưu mã nguồn đã thay đổi, không thể chấm lại an toàn.');
  }
  const archive = new AdmZip(zipPath);
  await fs.mkdir(destinationPath, { recursive: true });
  archive.extractAllTo(destinationPath, true);
};
