import path from 'node:path';
import fs from 'node:fs/promises';
import { env } from '../config/env.js';

/**
 * Manages the per-submission staging directories on disk that get mounted
 * into the Docker sandbox by TV5. One directory per submission, keyed by id,
 * so concurrent gradings never collide.
 */
export class WorkspaceService {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string = env.WORKSPACE_DIR) {
    this.workspaceRoot = path.resolve(workspaceRoot);
  }

  public getWorkspacePath(submissionId: string): string {
    return path.join(this.workspaceRoot, submissionId);
  }

  public async createCleanWorkspace(submissionId: string): Promise<string> {
    const workspacePath = this.getWorkspacePath(submissionId);
    await fs.rm(workspacePath, { recursive: true, force: true });
    await fs.mkdir(workspacePath, { recursive: true });
    return workspacePath;
  }

  /** Called once grading is finished (by the queue worker) to free disk space. */
  public async cleanupWorkspace(submissionId: string): Promise<void> {
    const workspacePath = this.getWorkspacePath(submissionId);
    await fs.rm(workspacePath, { recursive: true, force: true });
  }
}

export const workspaceService = new WorkspaceService();
