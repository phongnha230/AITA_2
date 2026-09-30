import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import { workspaceService, WorkspaceService } from './workspace.service.js';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const execFileAsync = promisify(execFile);

export interface GitIngestionResult {
  stagedPath: string;
  commitCount: number;
  locChurn: number;
  resolvedCommitHash: string;
  extractedVercelUrl?: string;
}

export class GitIngestionService {
  constructor(private readonly workspace: WorkspaceService = workspaceService) {}

  /**
   * Clone Git repository sinh viên, checkout commit và phân tích metadata (Commit count, LOC churn)
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
      await execFileAsync('git', ['clone', '--depth', '50', cleanRepoUrl, workspacePath], {
        timeout: 60000,
      });

      // 2. Checkout Commit cụ thể nếu sinh viên chỉ định
      let resolvedHash = gitCommitHash || '';
      if (gitCommitHash && gitCommitHash.trim()) {
        await execFileAsync('git', ['checkout', gitCommitHash.trim()], {
          cwd: workspacePath,
          timeout: 10000,
        });
        resolvedHash = gitCommitHash.trim();
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

      // 4. Tính toán mức độ biến động code (LOC Churn)
      let locChurn = 0;
      try {
        const { stdout: statOut } = await execFileAsync(
          'git',
          ['log', '--shortstat', '--no-merges'],
          {
            cwd: workspacePath,
            timeout: 10000,
          }
        );

        // Regex tìm "X insertions(+), Y deletions(-)"
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

      // 5. Kiểm tra có config Vercel / Target URL hay không
      let extractedVercelUrl: string | undefined;
      try {
        const vercelPath = path.join(workspacePath, 'vercel.json');
        const vercelData = JSON.parse(await fs.readFile(vercelPath, 'utf8'));
        if (vercelData.alias) {
          extractedVercelUrl = `https://${vercelData.alias}`;
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
      };
    } catch (err: any) {
      // Dọn dẹp thư mục nếu clone lỗi
      await this.workspace.cleanupWorkspace(submissionId);
      throw new Error(`[GitIngestionService] Lỗi khi clone và xử lý Git repo: ${err.message}`);
    }
  }
}

export const gitIngestionService = new GitIngestionService();
