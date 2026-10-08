import path from 'node:path';
import fs from 'node:fs/promises';
import { env } from '../config/env.js';

export class WorkspaceCleanupService {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string = env.WORKSPACE_DIR) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  /**
   * Dọn dẹp các file nhị phân trung gian (.out, .exe, .class, data.txt) sau khi chấm xong
   * Giữ lại các file mã nguồn (.c, .java) để sinh viên và AI có thể đối chiếu.
   */
  public async cleanupBuildArtifacts(submissionId: string): Promise<void> {
    const workspacePath = path.join(this.workspaceRoot, submissionId);
    try {
      await this.removeArtifactsRecursive(workspacePath);
    } catch (err: any) {
      console.warn(`[WorkspaceCleanup] Failed to clean build artifacts for ${submissionId}:`, err.message);
    }
  }

  /**
   * Tự động quét và xóa các Workspace cũ đã lưu quá số ngày quy định (mặc định: 7 ngày)
   */
  public async cleanupOldWorkspaces(maxAgeDays: number = 7): Promise<number> {
    let deletedCount = 0;
    const now = Date.now();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

    try {
      const entries = await fs.readdir(this.workspaceRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const dirPath = path.join(this.workspaceRoot, entry.name);
          const stat = await fs.stat(dirPath);
          if (now - stat.mtimeMs > maxAgeMs) {
            await fs.rm(dirPath, { recursive: true, force: true });
            deletedCount++;
          }
        }
      }
      if (deletedCount > 0) {
        console.log(`🧹 [WorkspaceCleanup] Đã dọn dẹp ${deletedCount} thư mục workspace cũ (> ${maxAgeDays} ngày)`);
      }
    } catch (err: any) {
      console.warn('[WorkspaceCleanup] Lỗi khi dọn dẹp workspace cũ:', err.message);
    }

    return deletedCount;
  }

  private async removeArtifactsRecursive(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'bin') {
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          await this.removeArtifactsRecursive(fullPath);
        }
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (
          ext === '.out' ||
          ext === '.exe' ||
          ext === '.class' ||
          entry.name === 'data.txt' ||
          entry.name === 'f1.txt'
        ) {
          await fs.rm(fullPath, { force: true });
        }
      }
    }
  }
}

export const workspaceCleanupService = new WorkspaceCleanupService();
