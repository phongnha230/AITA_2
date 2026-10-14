export interface RagIndexingRequest {
  solutionId: string;
  contentHash: string;
}

export interface IRagIndexingQueue {
  enqueue(data: RagIndexingRequest): Promise<void>;
}
