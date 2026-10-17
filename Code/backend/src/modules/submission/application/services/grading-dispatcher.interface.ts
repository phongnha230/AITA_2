export interface IGradingDispatcher {
  dispatch(submissionId: string, stagedPath: string, requestedById?: string): Promise<void>;
}
