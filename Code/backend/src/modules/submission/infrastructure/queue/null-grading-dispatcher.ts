import { IGradingDispatcher } from '../../application/services/grading-dispatcher.interface.js';

export class NullGradingDispatcher implements IGradingDispatcher {
  public async dispatch(submissionId: string, stagedPath: string): Promise<void> {
    console.log(
      `[NullGradingDispatcher] Staged submission ${submissionId} at ${stagedPath || '<remote-git>'}. No-op dispatch pending Worker integration.`
    );
  }
}

export const nullGradingDispatcher = new NullGradingDispatcher();
