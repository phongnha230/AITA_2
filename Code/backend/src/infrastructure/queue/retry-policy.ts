export const GRADING_MAX_ATTEMPTS = 5;
export const RAG_INDEX_MAX_ATTEMPTS = 6;
export const RAG_INDEX_RETRY_DELAYS_MS = [10_000, 30_000, 120_000, 300_000, 900_000] as const;

export function getRagIndexRetryDelay(attemptsMade: number): number {
  const index = Math.min(Math.max(attemptsMade - 1, 0), RAG_INDEX_RETRY_DELAYS_MS.length - 1);
  return RAG_INDEX_RETRY_DELAYS_MS[index];
}
