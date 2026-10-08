import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import { workspaceService, WorkspaceService } from './workspace.service.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const execFileAsync = promisify(execFile);

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
    submissionId: string
  ): Promise<GitIngestionResult> {
    if (!gitRepoUrl || !gitRepoUrl.trim().startsWith('http')) {
      throw new ValidationError('Đường dẫn GitHub repository không hợp lệ');
    }

    const cleanRepoUrl = gitRepoUrl.trim();
    const workspacePath = await this.workspace.createCleanWorkspace(submissionId);

    try {
      // 1. Git Clone với depth 50 để lấy lịch sử commits gần nhất
      try {
        await execFileAsync('git', ['clone', '--depth', '50', cleanRepoUrl, workspacePath], {
          timeout: 60000,
        });
      } catch (cloneErr: any) {
        const errorMsg = cloneErr.stderr || cloneErr.message || '';
        if (
          errorMsg.includes('Authentication failed') ||
          errorMsg.includes('Repository not found') ||
          errorMsg.includes('fatal: could not read Username')
        ) {
          throw new ValidationError(
            'Không thể truy cập GitHub repository. Vui lòng đảm bảo repository ở chế độ Public (công khai) hoặc đường dẫn chính xác.'
          );
        }
        throw new ValidationError(`Lỗi khi clone Git repository: ${errorMsg}`);
      }

      // 2. Checkout Commit cụ thể nếu sinh viên chỉ định
      let resolvedHash = gitCommitHash || '';
      if (gitCommitHash && gitCommitHash.trim()) {
        try {
          await execFileAsync('git', ['checkout', gitCommitHash.trim()], {
            cwd: workspacePath,
            timeout: 10000,
          });
          resolvedHash = gitCommitHash.trim();
        } catch {
          throw new ValidationError(`Mã Git Commit Hash '${gitCommitHash}' không tồn tại trong repository.`);
        }
      } else {
        const { stdout: headHash } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
          cwd: workspacePath,
          timeout: 5000,
        });
        resolvedHash = headHash.trim();
      }

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
    } catch (err: any) {
      await this.workspace.cleanupWorkspace(submissionId);
      if (err instanceof ValidationError) throw err;
      throw new Error(`[GitIngestionService] Lỗi khi clone và xử lý Git repo: ${err.message}`);
    }
  }
}

export const gitIngestionService = new GitIngestionService();

