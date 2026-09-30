/**
 * Hand-off contract to Thành viên 4's Redis/BullMQ Job Lifecycle Coordinator.
 * TV3's `submit-assignment.use-case.ts` only needs to know a submission is
 * ready for grading — it does not know (or care) how the queue is implemented.
 *
 * TV4 provides the real implementation (pushing to BullMQ with `priority`)
 * behind this same interface; until then `NullGradingDispatcher` is a no-op
 * so the ZIP ingestion flow works end-to-end in isolation.
 */
export interface IGradingDispatcher {
  dispatch(submissionId: string, stagedPath: string): Promise<void>;
}
