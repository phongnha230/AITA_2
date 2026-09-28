import { IGradingDispatcher } from '../../application/services/grading-dispatcher.interface.js';

/**
 * Placeholder `IGradingDispatcher` used until Thành viên 4 wires the real
 * BullMQ producer (`bullmq.queue.ts`) behind this interface. It only logs the
 * hand-off so the ZIP ingestion & staging flow (TV3) is independently
 * testable end-to-end without depending on TV4's queue module.
 */
export class NullGradingDispatcher implements IGradingDispatcher {
  public async dispatch(submissionId: string, stagedPath: string): Promise<void> {
    console.log(
      `[NullGradingDispatcher] Submission ${submissionId} staged at "${stagedPath}" — ` +
        'waiting for TV4 BullMQ producer to be wired in.'
    );
  }
}

export const nullGradingDispatcher = new NullGradingDispatcher();
