import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import { workspaceService, WorkspaceService } from './workspace.service.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';
import { validateGitHubRepositoryUrl } from './github-url.validator.js';
import { logger } from '../../../../infrastructure/logging/logger.js';
export { validateGitHubRepositoryUrl } from './github-url.validator.js';

const execFileAsync = promisify(execFile);
const MAX_FILES = 5_000;
const MAX_DEPTH = 20;

const validateWorkingTree = async (root: string, maxBytes: bigint | number): Promise<void> => {
  const limit = Number(maxBytes);
  if (!Number.isSafeInteger(limit) || limit <= 0) {
    throw new ValidationError('Giới hạn dung lượng bài nộp không hợp lệ.');
  }

  let fileCount = 0;
  let totalBytes = 0;
  const visit = async (current: string, depth: number): Promise<void> => {
    if (depth > MAX_DEPTH) {
      throw new ValidationError(`Repository vượt quá độ sâu thư mục tối đa ${MAX_DEPTH}.`);
    }
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      if (depth === 0 && entry.name === '.git') continue;
      const absolutePath = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        throw new ValidationError('Repository không được chứa symbolic link.');
      }
      if (entry.isDirectory()) {
        await visit(absolutePath, depth + 1);
        continue;
      }
      if (!entry.isFile()) continue;
      fileCount += 1;
      if (fileCount > MAX_FILES) {
        throw new ValidationError(`Repository vượt quá ${MAX_FILES} files.`);
      }
      totalBytes += (await fs.stat(absolutePath)).size;
      if (totalBytes > limit) {
        throw new ValidationError('Repository vượt quá giới hạn dung lượng của đề thi.');
      }
    }
  };
  await visit(root, 0);
};

export interface ContributorMetric {
  authorName: string;
  authorEmail: string;
  commitCount: number;
  linesAdded: number;
  linesDeleted: number;
  contributionPct: number;
}

export interface GitIngestionResult {
  stagedPath: string;
  commitCount: number;
  locChurn: number;
  resolvedCommitHash: string;
  extractedVercelUrl?: string;
  contributors: ContributorMetric[];
}

export class GitIngestionService {
  constructor(private readonly workspace: WorkspaceService = workspaceService) {}

  /**
   * Clone Git repository sinh viên, checkout commit và phân tích metadata (Commit count, LOC churn, Contributor breakdown)
   */
  public async cloneAndAnalyze(
    gitRepoUrl: string,
    gitCommitHash: string | null | undefined,
    submissionId: string,
    maxFileSizeBytes: bigint | number
  ): Promise<GitIngestionResult> {
    const cleanRepoUrl = validateGitHubRepositoryUrl(gitRepoUrl);
    const workspacePath = await this.workspace.createCleanWorkspace(submissionId);

    try {
      // Shallow clone only; submodules are intentionally not initialized.
      try {
        await execFileAsync('git', [
          '-c',
          'protocol.ext.allow=never',
          'clone',
          '--depth',
          '1',
          '--single-branch',
          '--no-tags',
          '--',
          cleanRepoUrl,
          workspacePath,
        ], {
          timeout: 60000,
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' },
        });
      } catch (cloneError: unknown) {
        logger.error('git_clone_failed', {
          submissionId,
          stage: 'GIT_CLONE',
          error: cloneError,
        });
        throw new ValidationError(
          'Không thể clone GitHub repository trong 60 giây. Hãy kiểm tra repository công khai và URL.'
        );
      }

      // 2. Checkout Commit cụ thể nếu sinh viên chỉ định
      let resolvedHash = gitCommitHash || '';
      if (gitCommitHash && gitCommitHash.trim()) {
        const cleanHash = gitCommitHash.trim();
        // Chỉ chấp nhận hex hash 7–40 ký tự — chặn argument injection (vd: --orphan)
        if (!/^[a-f0-9]{7,40}$/i.test(cleanHash)) {
          throw new ValidationError(
            'Mã Git Commit Hash không hợp lệ. Chỉ chấp nhận mã hex 7–40 ký tự (ví dụ: a3f1c2d).'
          );
        }
        try {
          await execFileAsync('git', ['-c', 'advice.detachedHead=false', 'checkout', '--detach', cleanHash], {
            cwd: workspacePath,
            timeout: 10000,
          });
          resolvedHash = cleanHash;
        } catch {
          throw new ValidationError(`Mã Git Commit Hash '${cleanHash}' không tồn tại trong repository.`);
        }
      } else {
        const { stdout: headHash } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
          cwd: workspacePath,
          timeout: 5000,
        });
        resolvedHash = headHash.trim();
      }

      await validateWorkingTree(workspacePath, maxFileSizeBytes);

      // 3. Đếm số lượng Commit (Commit Count)
      let commitCount = 1;
      try {
        const { stdout: countOut } = await execFileAsync('git', ['rev-list', '--count', 'HEAD'], {
          cwd: workspacePath,
          timeout: 5000,
        });
        commitCount = parseInt(countOut.trim(), 10) || 1;
      } catch {
        commitCount = 1;
      }

      // 4. Tính toán mức độ biến động code (LOC Churn) & bóc tách từng tác giả (Contributors)
      let locChurn = 0;
      const contributorsMap = new Map<
        string,
        { name: string; email: string; commits: number; added: number; deleted: number }
      >();

      try {
        const { stdout: shortlogOut } = await execFileAsync(
          'git',
          ['shortlog', '-sne', '--no-merges', 'HEAD'],
          {
            cwd: workspacePath,
            timeout: 10000,
          }
        );

        const lines = shortlogOut.split('\n').filter(Boolean);
        for (const line of lines) {
          const match = line.trim().match(/^(\d+)\s+(.+?)\s+<([^>]+)>/);
          if (match) {
            const count = parseInt(match[1], 10) || 0;
            const name = match[2].trim();
            const email = match[3].trim().toLowerCase();
            contributorsMap.set(email, {
              name,
              email,
              commits: count,
              added: 0,
              deleted: 0,
            });
          }
        }

        const { stdout: statOut } = await execFileAsync(
          'git',
          ['log', '--shortstat', '--no-merges'],
          {
            cwd: workspacePath,
            timeout: 10000,
          }
        );

        const insertionMatches = statOut.match(/(\d+)\s+insertion/g) || [];
        const deletionMatches = statOut.match(/(\d+)\s+deletion/g) || [];

        let insertions = 0;
        let deletions = 0;

        for (const m of insertionMatches) {
          const num = parseInt(m.split(' ')[0], 10);
          if (!isNaN(num)) insertions += num;
        }

        for (const m of deletionMatches) {
          const num = parseInt(m.split(' ')[0], 10);
          if (!isNaN(num)) deletions += num;
        }

        locChurn = insertions + deletions;
      } catch {
        locChurn = 0;
      }

      // 5. Tính % đóng góp của từng thành viên
      const contributors: ContributorMetric[] = [];
      const totalCommits = Array.from(contributorsMap.values()).reduce(
        (sum, c) => sum + c.commits,
        0
      );

      for (const c of contributorsMap.values()) {
        const pct = totalCommits > 0 ? Number(((c.commits / totalCommits) * 100).toFixed(2)) : 100;
        contributors.push({
          authorName: c.name,
          authorEmail: c.email,
          commitCount: c.commits,
          linesAdded: c.added,
          linesDeleted: c.deleted,
          contributionPct: pct,
        });
      }

      // 6. Kiểm tra có config Vercel / Target URL / Homepage hay không
      let extractedVercelUrl: string | undefined;
      try {
        // Ưu tiên 1: file target_url.txt
        const targetUrlPath = path.join(workspacePath, 'target_url.txt');
        try {
          const targetUrl = await fs.readFile(targetUrlPath, 'utf8');
          if (targetUrl.trim().startsWith('http')) {
            extractedVercelUrl = targetUrl.trim();
          }
        } catch {
          // ignore
        }

        // Ưu tiên 2: file vercel.json
        if (!extractedVercelUrl) {
          const vercelPath = path.join(workspacePath, 'vercel.json');
          try {
            const vercelData = JSON.parse(await fs.readFile(vercelPath, 'utf8'));
            if (vercelData.alias) {
              extractedVercelUrl = `https://${vercelData.alias}`;
            }
          } catch {
            // ignore
          }
        }

        // Ưu tiên 3: package.json homepage
        if (!extractedVercelUrl) {
          const pkgPath = path.join(workspacePath, 'package.json');
          try {
            const pkgData = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
            if (pkgData.homepage && typeof pkgData.homepage === 'string' && pkgData.homepage.startsWith('http')) {
              extractedVercelUrl = pkgData.homepage.trim();
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }

      return {
        stagedPath: workspacePath,
        commitCount,
        locChurn,
        resolvedCommitHash: resolvedHash,
        extractedVercelUrl,
        contributors,
      };
    } catch (err: unknown) {
      await this.workspace.cleanupWorkspace(submissionId);
      if (err instanceof ValidationError) throw err;
      logger.error('git_ingestion_failed', {
        submissionId,
        stage: 'GIT_INGESTION',
        error: err,
      });
      throw new Error('[GitIngestionService] Lỗi khi clone và xử lý Git repository.');
    }
  }
}

export const gitIngestionService = new GitIngestionService();

