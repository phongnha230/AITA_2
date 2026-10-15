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
  matchedUserId: string | null;
  activeDays: number;
  firstCommitAt: Date | null;
  lastCommitAt: Date | null;
}

export interface GitParticipantIdentity {
  userId: string;
  accountEmail?: string | null;
  gitAuthorEmail?: string | null;
  githubUsername?: string | null;
}

export interface GitAnalysisWindow {
  since: Date;
  until: Date;
  participantIdentities?: GitParticipantIdentity[];
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
    maxFileSizeBytes: bigint | number,
    analysisWindow: GitAnalysisWindow
  ): Promise<GitIngestionResult> {
    const cleanRepoUrl = validateGitHubRepositoryUrl(gitRepoUrl);
    let workspacePath = '';

    try {
      workspacePath = await this.workspace.createCleanWorkspace(submissionId);
      const cloneStartedAt = Date.now();
      try {
        await execFileAsync('git', [
          '-c',
          'protocol.ext.allow=never',
          'clone',
          '--filter=blob:none',
          '--no-tags',
          '--',
          cleanRepoUrl,
          workspacePath,
        ], {
          timeout: 60000,
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' },
        });
        logger.info('git_clone_completed', {
          submissionId,
          stage: 'GIT_CLONE',
          durationMs: Date.now() - cloneStartedAt,
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
      let resolvedHash = '';
      if (gitCommitHash && gitCommitHash.trim()) {
        const cleanHash = gitCommitHash.trim();
        // Chỉ chấp nhận hex hash 7–40 ký tự — chặn argument injection (vd: --orphan)
        if (!/^[a-f0-9]{7,40}$/i.test(cleanHash)) {
          throw new ValidationError(
            'Mã Git Commit Hash không hợp lệ. Chỉ chấp nhận mã hex 7–40 ký tự (ví dụ: a3f1c2d).'
          );
        }
        try {
          try {
            await execFileAsync('git', ['cat-file', '-e', `${cleanHash}^{commit}`], {
              cwd: workspacePath,
              timeout: 10_000,
            });
          } catch {
            await execFileAsync('git', ['fetch', '--no-tags', 'origin', cleanHash], {
              cwd: workspacePath,
              timeout: 30_000,
              env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' },
            });
          }
          await execFileAsync('git', ['-c', 'advice.detachedHead=false', 'checkout', '--detach', cleanHash], {
            cwd: workspacePath,
            timeout: 10000,
          });
        } catch {
          throw new ValidationError(`Mã Git Commit Hash '${cleanHash}' không tồn tại trong repository.`);
        }
      }

      const { stdout: headHash } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
        cwd: workspacePath,
        timeout: 5000,
      });
      resolvedHash = headHash.trim().toLowerCase();
      if (!/^[a-f0-9]{40}$/.test(resolvedHash)) {
        throw new ValidationError('Không thể resolve commit thành full SHA 40 ký tự.');
      }

      await validateWorkingTree(workspacePath, maxFileSizeBytes);

      let commitCount = 0;
      const contributorsMap = new Map<
        string,
        {
          name: string;
          email: string;
          commits: number;
          added: number;
          deleted: number;
          activeDays: Set<string>;
          firstCommitAt: Date | null;
          lastCommitAt: Date | null;
        }
      >();

      try {
        const { stdout: logOutput } = await execFileAsync(
          'git',
          [
            'log',
            '--no-merges',
            `--since=${analysisWindow.since.toISOString()}`,
            `--until=${analysisWindow.until.toISOString()}`,
            '--format=%x1e%H%x1f%an%x1f%ae%x1f%aI',
            '--numstat',
            'HEAD',
          ],
          {
            cwd: workspacePath,
            timeout: 30_000,
            maxBuffer: 10 * 1024 * 1024,
          }
        );
        const excludedPath = /(^|\/)(node_modules|dist|build|coverage)(\/|$)|(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$|\.min\.(js|css)$/i;
        for (const record of logOutput.split('\x1e').filter((item) => item.trim())) {
          const [header, ...numstatLines] = record.trim().split(/\r?\n/);
          const [, name = '', rawEmail = '', isoDate = ''] = header.split('\x1f');
          const email = rawEmail.trim().toLowerCase();
          if (!email || /(?:dependabot|\[bot\]|bot@)/i.test(`${name} ${email}`)) continue;
          const commitDate = new Date(isoDate);
          const contributor = contributorsMap.get(email) ?? {
            name: name.trim(),
            email,
            commits: 0,
            added: 0,
            deleted: 0,
            activeDays: new Set<string>(),
            firstCommitAt: null,
            lastCommitAt: null,
          };
          contributor.commits += 1;
          commitCount += 1;
          if (!Number.isNaN(commitDate.getTime())) {
            contributor.activeDays.add(commitDate.toISOString().slice(0, 10));
            contributor.firstCommitAt = !contributor.firstCommitAt || commitDate < contributor.firstCommitAt ? commitDate : contributor.firstCommitAt;
            contributor.lastCommitAt = !contributor.lastCommitAt || commitDate > contributor.lastCommitAt ? commitDate : contributor.lastCommitAt;
          }
          for (const line of numstatLines) {
            const [added, deleted, filePath = ''] = line.split('\t');
            if (!filePath || excludedPath.test(filePath)) continue;
            contributor.added += /^\d+$/.test(added) ? Number(added) : 0;
            contributor.deleted += /^\d+$/.test(deleted) ? Number(deleted) : 0;
          }
          contributorsMap.set(email, contributor);
        }
      } catch (error) {
        logger.error('git_analysis_failed', { submissionId, stage: 'GIT_ANALYSIS', error });
        throw new Error('Không thể phân tích lịch sử Git của bài nộp.');
      }

      const locChurn = Array.from(contributorsMap.values()).reduce(
        (sum, contributor) => sum + contributor.added + contributor.deleted,
        0
      );
      const contributors: ContributorMetric[] = [];
      const totalCommits = Array.from(contributorsMap.values()).reduce(
        (sum, c) => sum + c.commits,
        0
      );

      const identities = analysisWindow.participantIdentities ?? [];
      const normalize = (value?: string | null): string => value?.trim().toLowerCase() ?? '';
      const totalChurn = locChurn;
      for (const c of contributorsMap.values()) {
        const commitShare = totalCommits > 0 ? c.commits / totalCommits : 0;
        const contributorChurn = c.added + c.deleted;
        const churnShare = totalChurn > 0 ? contributorChurn / totalChurn : 0;
        const pct = Number(((totalChurn > 0 ? (0.3 * commitShare) + (0.7 * churnShare) : commitShare) * 100).toFixed(2));
        const noreplyUsername = c.email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i)?.[1]?.toLowerCase();
        const matchedIdentity = identities.find((identity) => {
          const emails = [identity.accountEmail, identity.gitAuthorEmail].map(normalize).filter(Boolean);
          return emails.includes(c.email) || Boolean(noreplyUsername && normalize(identity.githubUsername) === noreplyUsername);
        });
        contributors.push({
          authorName: c.name,
          authorEmail: c.email,
          commitCount: c.commits,
          linesAdded: c.added,
          linesDeleted: c.deleted,
          contributionPct: pct,
          matchedUserId: matchedIdentity?.userId ?? null,
          activeDays: c.activeDays.size,
          firstCommitAt: c.firstCommitAt,
          lastCommitAt: c.lastCommitAt,
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
      logger.error('git_ingestion_failed', {
        submissionId,
        stage: 'GIT_INGESTION',
        error: err,
      });
      try {
        await this.workspace.cleanupWorkspace(submissionId);
      } catch (cleanupError) {
        logger.error('git_ingestion_cleanup_failed', {
          submissionId,
          stage: 'GIT_CLEANUP',
          workspacePath,
          error: cleanupError,
        });
      }
      if (err instanceof ValidationError) throw err;
      throw new Error('[GitIngestionService] Lỗi khi clone và xử lý Git repository.');
    }
  }
}

export const gitIngestionService = new GitIngestionService();

