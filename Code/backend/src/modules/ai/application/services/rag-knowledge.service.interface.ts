export interface RelevantSolutionChunk {
  id: string;
  symbol: string;
  file: string;
  code: string;
  startLine: number;
  endLine: number;
  similarity: number;
  embeddingModel: string;
  chunkerVersion: string;
}

export interface RagContext {
  assignmentTitle: string;
  assignmentDescription: string | null;
  environment: string;
  referenceSolutionSource: string;
  relevantSolutionChunks: RelevantSolutionChunk[];
  rubricRules: Array<{
    id: string;
    criterionName: string;
    description: string;
    maxPoints: number;
    weight: number;
  }>;
  failedTestCases: Array<{
    label: string;
    rationaleTag: string;
    verdict: string;
    actualStdout: string | null;
    diffLog: string | null;
  }>;
}

export interface IRagKnowledgeService {
  getGradingContext(submissionId: string, studentCode: string): Promise<RagContext>;
}
