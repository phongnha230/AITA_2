import fs from 'node:fs/promises';
import path from 'node:path';
import { AppError } from '../../../../shared/domain/exceptions/app.error.js';

export type SourceLanguage = 'C_GCC' | 'JAVA_JDK' | 'REACT_JS';
const IGNORED_DIRECTORIES = new Set([
  '.git', 'bin', 'node_modules', '__MACOSX', '.next', 'dist', 'build', 'coverage',
]);
const MAX_FILES = 200;
const MAX_TOTAL_BYTES = 1024 * 1024;
const MAX_FILE_BYTES = 64 * 1024;
const MAX_REACT_DISCOVERED_FILES = 2_000;
const MAX_REACT_SELECTED_FILES = 24;
const MAX_REACT_TOTAL_BYTES = 128 * 1024;
const MAX_REACT_FILE_BYTES = 32 * 1024;
const MAX_REACT_MANIFEST_FILES = 300;

interface SourceCandidate {
  absolutePath: string;
  relativePath: string;
  bytes: number;
}

export class SourceInputTooLargeError extends AppError {
  constructor(message: string) {
    super(message, 422, 'INPUT_TOO_LARGE');
  }
}

export class SourceLanguageMismatchError extends AppError {
  constructor(language: SourceLanguage, fileName: string) {
    super(`${fileName} không thuộc định dạng source của bài ${language}.`, 422, 'SOURCE_LANGUAGE_MISMATCH');
  }
}

export interface CollectedSource {
  combinedSource: string;
  files: Array<{ relativePath: string; bytes: number }>;
  totalBytes: number;
  omittedFileCount?: number;
  selectionStrategy?: 'ALL_SOURCE' | 'REACT_PRIORITY_BUDGET';
}

export class SourceCollector {
  async collect(root: string, language: SourceLanguage): Promise<CollectedSource> {
    if (language === 'REACT_JS') {
      return this.collectReactSource(root);
    }

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
        if (!entry.isFile()) continue;
        const extension = path.extname(entry.name).toLowerCase();
        if (language === 'C_GCC' && extension === '.java') {
          throw new SourceLanguageMismatchError(language, entry.name);
        }
        if (language === 'JAVA_JDK' && (extension === '.c' || extension === '.h')) {
          throw new SourceLanguageMismatchError(language, entry.name);
        }
        const allowedExtensions = language === 'C_GCC'
          ? new Set(['.c', '.h'])
          : new Set(['.java']);
        if (!allowedExtensions.has(extension)) continue;
        if (/\.min\.(?:js|css)$/i.test(entry.name) || /^(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/i.test(entry.name)) {
          continue;
        }

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
      omittedFileCount: 0,
      selectionStrategy: 'ALL_SOURCE',
    };
  }

  private async collectReactSource(root: string): Promise<CollectedSource> {
    const resolvedRoot = path.resolve(root);
    const candidates: SourceCandidate[] = [];

    const visit = async (directory: string): Promise<void> => {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (IGNORED_DIRECTORIES.has(entry.name)) continue;
        const absolutePath = path.join(directory, entry.name);
        if (entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) {
          await visit(absolutePath);
          continue;
        }
        if (!entry.isFile()) continue;

        const relativePath = path.relative(resolvedRoot, absolutePath);
        if (!this.isReactAnalysisCandidate(relativePath)) continue;
        const stat = await fs.stat(absolutePath);
        candidates.push({ absolutePath, relativePath, bytes: stat.size });
        if (candidates.length > MAX_REACT_DISCOVERED_FILES) {
          throw new SourceInputTooLargeError(
            `Repository React vượt quá ${MAX_REACT_DISCOVERED_FILES} file source có thể phân tích.`
          );
        }
      }
    };

    await visit(resolvedRoot);
    candidates.sort((left, right) => {
      const priorityDifference = this.getReactFilePriority(left.relativePath)
        - this.getReactFilePriority(right.relativePath);
      return priorityDifference || left.relativePath.localeCompare(right.relativePath);
    });

    const selected: SourceCandidate[] = [];
    let totalBytes = 0;
    for (const candidate of candidates) {
      if (selected.length >= MAX_REACT_SELECTED_FILES) break;
      const includedBytes = Math.min(candidate.bytes, MAX_REACT_FILE_BYTES);
      if (totalBytes + includedBytes > MAX_REACT_TOTAL_BYTES) continue;
      selected.push(candidate);
      totalBytes += includedBytes;
    }

    const contents = await Promise.all(selected.map(async (file) => {
      const content = await this.readFilePrefix(file.absolutePath, MAX_REACT_FILE_BYTES);
      const truncationNotice = file.bytes > MAX_REACT_FILE_BYTES
        ? `\n// [AITA] File truncated after ${MAX_REACT_FILE_BYTES} bytes for bounded semantic review.`
        : '';
      return `// File: ${file.relativePath}\n${content}${truncationNotice}`;
    }));
    const manifest = candidates
      .slice(0, MAX_REACT_MANIFEST_FILES)
      .map((file) => file.relativePath)
      .join('\n');
    const omittedFileCount = Math.max(0, candidates.length - selected.length);
    const selectionHeader = [
      '// [AITA_REACT_SOURCE_SELECTION]',
      `// Strategy: priority budget (${selected.length}/${candidates.length} files, ${totalBytes}/${MAX_REACT_TOTAL_BYTES} bytes).`,
      '// Priority: package/entry/router/context/store/hooks/pages/features/components, then remaining source.',
      `// Omitted from prompt: ${omittedFileCount} candidate files. Do not infer defects in omitted files.`,
      '// [REPOSITORY_FILE_MANIFEST]',
      manifest || '(empty)',
      '// [/REPOSITORY_FILE_MANIFEST]',
    ].join('\n');

    return {
      combinedSource: [selectionHeader, ...contents].join('\n\n'),
      files: selected.map(({ relativePath, bytes }) => ({
        relativePath,
        bytes: Math.min(bytes, MAX_REACT_FILE_BYTES),
      })),
      totalBytes,
      omittedFileCount,
      selectionStrategy: 'REACT_PRIORITY_BUDGET',
    };
  }

  private isReactAnalysisCandidate(relativePath: string): boolean {
    const normalized = relativePath.replace(/\\/g, '/');
    const fileName = path.posix.basename(normalized);
    if (/\.(?:test|spec|stories)\.[jt]sx?$/i.test(fileName)) return false;
    if (/(^|\/)(?:__tests__|fixtures|mocks|public|assets)(\/|$)/i.test(normalized)) return false;
    if (/\.d\.ts$|\.min\.(?:js|css)$/i.test(fileName)) return false;
    if (/^(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/i.test(fileName)) return false;
    if (fileName === 'package.json') return true;
    return /\.(?:js|jsx|ts|tsx|css|scss)$/i.test(fileName);
  }

  private getReactFilePriority(relativePath: string): number {
    const normalized = relativePath.replace(/\\/g, '/').toLowerCase();
    const fileName = path.posix.basename(normalized);
    if (fileName === 'package.json') return 0;
    if (/(^|\/)(?:main|index|app|root)\.[jt]sx?$/.test(normalized)) return 1;
    if (/(^|\/)(?:routes?|router|contexts?|stores?|hooks?)(\/|\.|-)/.test(normalized)) return 2;
    if (/(^|\/)(?:pages?|views?|features?)(\/|$)/.test(normalized)) return 3;
    if (/(^|\/)components?(\/|$)/.test(normalized)) return 4;
    if (/(^|\/)(?:services?|api|lib|utils?)(\/|$)/.test(normalized)) return 5;
    if (/\.(?:css|scss)$/.test(normalized)) return 7;
    return 6;
  }

  private async readFilePrefix(absolutePath: string, maximumBytes: number): Promise<string> {
    let handle: Awaited<ReturnType<typeof fs.open>> | null = null;
    try {
      handle = await fs.open(absolutePath, 'r');
      const buffer = Buffer.alloc(maximumBytes);
      const { bytesRead } = await handle.read(buffer, 0, maximumBytes, 0);
      return buffer.subarray(0, bytesRead).toString('utf8');
    } finally {
      await handle?.close();
    }
  }
}
