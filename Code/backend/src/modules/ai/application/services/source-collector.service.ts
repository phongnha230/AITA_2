import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';

const ALLOWED_EXTENSIONS = new Set(['.c', '.h', '.java']);
const IGNORED_DIRECTORIES = new Set(['.git', 'bin', 'node_modules', '__MACOSX']);
const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 1024 * 1024;
const MAX_FILE_BYTES = 64 * 1024;

export class SourceInputTooLargeError extends AppError {
  constructor(message: string) {
    super(message, 422, 'INPUT_TOO_LARGE');
  }
}

export interface CollectedSource {
  combinedSource: string;
  files: Array<{ relativePath: string; bytes: number }>;
  totalBytes: number;
}

export class SourceCollector {
  async collect(root: string): Promise<CollectedSource> {
    const resolvedRoot = path.resolve(root);
    const files: Array<{ absolutePath: string; relativePath: string; bytes: number }> = [];
    let totalBytes = 0;

    const visit = async (directory: string): Promise<void> => {
      for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue;
        const absolutePath = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) {
          await visit(absolutePath);
          continue;
        }
        if (!entry.isFile() || !ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;

        const stat = await fs.stat(absolutePath);
        if (stat.size > MAX_FILE_BYTES) {
          throw new SourceInputTooLargeError(`Source file ${entry.name} vượt quá 64 KiB.`);
        }
        files.push({
          absolutePath,
          relativePath: path.relative(resolvedRoot, absolutePath),
          bytes: stat.size,
        });
        if (files.length > MAX_FILES) {
          throw new SourceInputTooLargeError(`Bài nộp vượt quá ${MAX_FILES} source files.`);
        }
        totalBytes += stat.size;
        if (totalBytes > MAX_TOTAL_BYTES) {
          throw new SourceInputTooLargeError('Tổng source code vượt quá 1 MiB.');
        }
      }
    };

    await visit(resolvedRoot);
    const contents = await Promise.all(
      files.map(async (file) => `// File: ${file.relativePath}\n${await fs.readFile(file.absolutePath, 'utf8')}`)
    );
    return {
      combinedSource: contents.join('\n\n'),
      files: files.map(({ relativePath, bytes }) => ({ relativePath, bytes })),
      totalBytes,
    };
  }
}
