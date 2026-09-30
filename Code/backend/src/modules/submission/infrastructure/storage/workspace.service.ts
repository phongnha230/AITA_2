import path from 'node:path';
import fs from 'node:fs/promises';
import { env } from '../../../../infrastructure/config/env.js';

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

  public async cleanupWorkspace(submissionId: string): Promise<void> {
    const workspacePath = this.getWorkspacePath(submissionId);
    await fs.rm(workspacePath, { recursive: true, force: true });
  }
}

export const workspaceService = new WorkspaceService();
