import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import * as unzipper from 'unzipper';
import {
  ArtifactStagingResult,
  ArtifactStructureType,
  IArtifactExtractor,
} from '../../application/services/artifact-extractor.interface.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { WorkspaceService, workspaceService } from './workspace.service.js';

const MAX_ENTRIES = 5_000;
const MAX_DEPTH = 20;
const MAX_COMPRESSION_RATIO = 100;
const JUNK_DIR_NAMES = new Set(['__MACOSX']);
const JUNK_FILE_NAMES = new Set(['.DS_Store', 'Thumbs.db']);
const QUESTION_DIR_PATTERN = /^q[1-4]$/i;

interface DirectoryTree {
  files: string[];
  dirs: string[];
}

const isJunkPathSegment = (segment: string): boolean =>
  JUNK_DIR_NAMES.has(segment) || JUNK_FILE_NAMES.has(segment) || segment.startsWith('._');

const isJunkZipEntry = (entryName: string): boolean =>
  entryName.split(/[/\\]/).filter(Boolean).some(isJunkPathSegment);

export const validateZipEntryPath = (entryName: string): string => {
  if (
    entryName.includes('\0') ||
    path.posix.isAbsolute(entryName) ||
    path.win32.isAbsolute(entryName) ||
    /^[a-zA-Z]:/.test(entryName)
  ) {
    throw new ValidationError('File ZIP chứa đường dẫn tuyệt đối hoặc không hợp lệ.');
  }

  const normalized = path.posix.normalize(entryName.replace(/\\/g, '/'));
  const segments = normalized.split('/').filter(Boolean);
  if (normalized === '..' || normalized.startsWith('../') || segments.includes('..')) {
    throw new ValidationError('Phát hiện đường dẫn bất thường trong file .zip (zip-slip).');
  }
  if (segments.length > MAX_DEPTH) {
    throw new ValidationError(`File ZIP vượt quá độ sâu thư mục tối đa ${MAX_DEPTH}.`);
  }
  return normalized;
};

export const isZipSymbolicLink = (externalAttributes: number): boolean => {
  const unixMode = (externalAttributes >>> 16) & 0xffff;
  return (unixMode & 0o170000) === 0o120000;
};

const walkDirectory = async (rootDir: string): Promise<DirectoryTree> => {
  const files: string[] = [];
  const dirs: string[] = [];

  const visit = async (currentDir: string, relativeBase: string): Promise<void> => {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (isJunkPathSegment(entry.name)) continue;
      const relativePath = relativeBase ? path.join(relativeBase, entry.name) : entry.name;
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isSymbolicLink()) {
        throw new ValidationError('Không chấp nhận symbolic link trong bài nộp.');
      }
      if (entry.isDirectory()) {
        dirs.push(relativePath);
        await visit(absolutePath, relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  };

  await visit(rootDir, '');
  return { files, dirs };
};

const detectStructure = (tree: DirectoryTree): {
  structureType: ArtifactStructureType;
  detectedEntries: string[];
} => {
  const cFiles = tree.files.filter((file) => file.toLowerCase().endsWith('.c'));
  const questionDirs = tree.dirs
    .filter((dir) => QUESTION_DIR_PATTERN.test(path.basename(dir)))
    .filter((dir) =>
      tree.files.some(
        (file) => file.startsWith(dir + path.sep) && file.toLowerCase().endsWith('.java')
      )
    );

  if (questionDirs.length > 0) {
    return { structureType: 'JAVA_MULTI_QUESTION', detectedEntries: questionDirs.sort() };
  }
  if (cFiles.length >= 1) {
    return { structureType: 'C_SINGLE_FILE', detectedEntries: cFiles.sort() };
  }
  return { structureType: 'UNKNOWN', detectedEntries: [] };
};

export class ZipExtractorService implements IArtifactExtractor {
  constructor(private readonly workspace: WorkspaceService = workspaceService) {}

  public async extractAndStage(
    zipFilePath: string,
    submissionId: string,
    maxExtractedBytes: bigint | number
  ): Promise<ArtifactStagingResult> {
    const maximumBytes = Number(maxExtractedBytes);
    if (!Number.isSafeInteger(maximumBytes) || maximumBytes <= 0) {
      throw new ValidationError('Giới hạn dung lượng bài nộp không hợp lệ.');
    }

    const stagedPath = await this.workspace.createCleanWorkspace(submissionId);
    const resolvedStagedPath = path.resolve(stagedPath);

    try {
      const directory = await unzipper.Open.file(zipFilePath);
      if (directory.files.length > MAX_ENTRIES) {
        throw new ValidationError(`File ZIP vượt quá ${MAX_ENTRIES} entries.`);
      }

      let totalBytes = 0;
      let junkEntriesRemoved = 0;
      const validatedFiles: Array<{ file: unzipper.File; relativePath: string }> = [];

      for (const file of directory.files) {
        const relativePath = validateZipEntryPath(file.path);
        if (isJunkZipEntry(relativePath)) {
          junkEntriesRemoved += 1;
          continue;
        }
        if (isZipSymbolicLink(file.externalFileAttributes)) {
          throw new ValidationError('Không chấp nhận symbolic link trong file ZIP.');
        }
        if (file.type === 'Directory') continue;

        totalBytes += file.uncompressedSize;
        if (totalBytes > maximumBytes) {
          throw new ValidationError('Tổng dung lượng giải nén vượt quá giới hạn của đề thi.');
        }

        const ratio = file.compressedSize === 0
          ? (file.uncompressedSize === 0 ? 1 : Number.POSITIVE_INFINITY)
          : file.uncompressedSize / file.compressedSize;
        if (ratio > MAX_COMPRESSION_RATIO) {
          throw new ValidationError(`File ZIP có compression ratio vượt quá ${MAX_COMPRESSION_RATIO}:1.`);
        }

        validatedFiles.push({ file, relativePath });
      }

      for (const { file, relativePath } of validatedFiles) {
        const destinationPath = path.resolve(stagedPath, ...relativePath.split('/'));
        if (!destinationPath.startsWith(`${resolvedStagedPath}${path.sep}`)) {
          throw new ValidationError('Phát hiện đường dẫn bất thường trong file .zip (zip-slip).');
        }
        await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
        await pipeline(file.stream(), fs.createWriteStream(destinationPath, { flags: 'wx' }));
      }

      const tree = await walkDirectory(stagedPath);
      const { structureType, detectedEntries } = detectStructure(tree);
      if (structureType === 'UNKNOWN') {
        throw new ValidationError(
          'Không nhận diện được cấu trúc bài nộp: cần file .c hoặc thư mục Q1..Q4 chứa file .java.'
        );
      }

      return { stagedPath, structureType, detectedEntries, junkEntriesRemoved };
    } catch (error) {
      await this.workspace.cleanupWorkspace(submissionId);
      if (error instanceof ValidationError) throw error;
      throw new ValidationError('File nộp bài không phải file ZIP hợp lệ hoặc đã bị hỏng.');
    }
  }
}

export const zipExtractorService = new ZipExtractorService();
