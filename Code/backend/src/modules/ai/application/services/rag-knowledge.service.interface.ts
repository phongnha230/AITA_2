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
  chunkType: string;
}

export interface RagContext {
  assignmentTitle: string;
  assignmentDescription: string | null;
  environment: string;
  courseCode: string | null;
  javaGradingProfile: 'PRO_OOP' | 'CSD_ALGORITHM' | 'JAVA_GENERAL' | null;
  algorithmSpecification: {
    expectedTimeComplexity: string | null;
    expectedSpaceComplexity: string | null;
    acceptedStrategies: string[];
    notes: string | null;
  };
  referenceSolutionSource: string;
  relevantSolutionChunks: RelevantSolutionChunk[];
  rubricRules: Array<{
    id: string;
    criterionName: string;
    description: string;
    maxPoints: number;
    weight: number;
    criterionType: 'GENERAL' | 'ALGORITHM' | 'CLEAN_CODE';
  }>;
  failedTestCases: Array<{
    label: string;
    rationaleTag: string;
    verdict: string;
    actualStdout: string | null;
    diffLog: string | null;
  }>;
  testPerformance: Array<{
    label: string;
    rationaleTag: string;
    verdict: string;
    executionTimeMs: number;
    memoryUsedKb: number;
  }>;
}

export interface IRagKnowledgeService {
  getGradingContext(submissionId: string, studentCode: string): Promise<RagContext>;
}
