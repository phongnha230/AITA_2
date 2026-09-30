export interface IGradingDispatcher {
  dispatch(submissionId: string, stagedPath: string): Promise<void>;
}
