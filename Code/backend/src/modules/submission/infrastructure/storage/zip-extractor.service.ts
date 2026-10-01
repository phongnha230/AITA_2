import path from 'node:path';
import fs from 'node:fs';
import AdmZip from 'adm-zip';
import {
  ArtifactStagingResult,
  ArtifactStructureType,
  IArtifactExtractor,
} from '../../application/services/artifact-extractor.interface.js';
import { WorkspaceService, workspaceService } from './workspace.service.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const JUNK_DIR_NAMES = new Set(['__MACOSX']);
const JUNK_FILE_NAMES = new Set(['.DS_Store', 'Thumbs.db']);
const QUESTION_DIR_PATTERN = /^q[1-4]$/i;

function isJunkPathSegment(segment: string): boolean {
  return JUNK_DIR_NAMES.has(segment) || JUNK_FILE_NAMES.has(segment) || segment.startsWith('._');
}

function isJunkZipEntry(entryName: string): boolean {
  const segments = entryName.split(/[/\\]/).filter(Boolean);
  return segments.some(isJunkPathSegment);
}

interface DirectoryTree {
  files: string[];
  dirs: string[];
}

async function walkDirectory(rootDir: string): Promise<DirectoryTree> {
  const files: string[] = [];
  const dirs: string[] = [];

  async function visit(currentDir: string, relativeBase: string): Promise<void> {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (isJunkPathSegment(entry.name)) {
        await fs.promises.rm(path.join(currentDir, entry.name), { recursive: true, force: true });
        continue;
      }

      const relativePath = relativeBase ? path.join(relativeBase, entry.name) : entry.name;
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        dirs.push(relativePath);
        await visit(absolutePath, relativePath);
      } else {
        files.push(relativePath);
      }
    }
  }

  await visit(rootDir, '');
  return { files, dirs };
}

function detectStructure(tree: DirectoryTree): {
  structureType: ArtifactStructureType;
  detectedEntries: string[];
} {
  const cFiles = tree.files.filter((file) => file.toLowerCase().endsWith('.c'));
  const questionDirs = tree.dirs
    .filter((dir) => QUESTION_DIR_PATTERN.test(path.basename(dir)))
    .filter((dir) =>
      tree.files.some(
        (file) => file.startsWith(dir + path.sep) && file.toLowerCase().endsWith('.java')
      )
    );

  if (questionDirs.length > 0) {
    return {
      structureType: 'JAVA_MULTI_QUESTION',
      detectedEntries: questionDirs.sort(),
    };
  }

  if (cFiles.length >= 1) {
    return {
      structureType: 'C_SINGLE_FILE',
      detectedEntries: cFiles.sort(),
    };
  }

  return { structureType: 'UNKNOWN', detectedEntries: [] };
}

export class ZipExtractorService implements IArtifactExtractor {
  constructor(private readonly workspace: WorkspaceService = workspaceService) {}

  public async extractAndStage(
    zipFilePath: string,
    submissionId: string
  ): Promise<ArtifactStagingResult> {
    let zip: AdmZip;
    try {
      zip = new AdmZip(zipFilePath);
    } catch {
      throw new ValidationError('File nộp bài không phải là file .zip hợp lệ hoặc đã bị hỏng');
    }

    const stagedPath = await this.workspace.createCleanWorkspace(submissionId);
    const resolvedStagedPath = path.resolve(stagedPath);

    let junkEntriesRemoved = 0;

    for (const entry of zip.getEntries()) {
      if (isJunkZipEntry(entry.entryName)) {
        junkEntriesRemoved += 1;
        continue;
      }

      if (entry.isDirectory) {
        continue;
      }

      const destinationPath = path.resolve(stagedPath, entry.entryName);

      // Zip-slip guard: refuse to write outside the sandboxed staging directory.
      if (
        !destinationPath.startsWith(resolvedStagedPath + path.sep) &&
        destinationPath !== resolvedStagedPath
      ) {
        throw new ValidationError('Phát hiện đường dẫn bất thường trong file .zip (zip-slip)');
      }

      await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
      await fs.promises.writeFile(destinationPath, entry.getData());
    }

    const tree = await walkDirectory(stagedPath);
    const { structureType, detectedEntries } = detectStructure(tree);

    if (structureType === 'UNKNOWN') {
      throw new ValidationError(
        'Không nhận diện được cấu trúc bài nộp: cần 1 file .c đơn lẻ (PRF192) hoặc các thư mục Q1..Q4 chứa file .java (PRO192/CSD201)'
      );
    }

    return {
      stagedPath,
      structureType,
      detectedEntries,
      junkEntriesRemoved,
    };
  }
}

export const zipExtractorService = new ZipExtractorService();
