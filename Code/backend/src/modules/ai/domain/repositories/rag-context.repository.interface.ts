export interface RagSubmissionData {
  compileOutput: string | null;
  assignment: {
    id: string;
    title: string;
    description: string | null;
    environment: string;
    courseCode: string | null;
    rubricRules: Array<{
      id: string;
      criterionName: string;
      description: string;
      maxPoints: number;
      weight: number;
      criterionType: 'GENERAL' | 'ALGORITHM' | 'CLEAN_CODE';
    }>;
    activeSolution: {
      id: string;
      assignmentId: string;
      activeKey: string | null;
      contentHash: string;
      indexStatus: 'PENDING' | 'READY' | 'FAILED';
      embeddingModel: string | null;
      chunkerVersion: string | null;
      sourceCode: string;
      expectedTimeComplexity: string | null;
      expectedSpaceComplexity: string | null;
      acceptedStrategies: unknown;
      algorithmNotes: string | null;
    } | null;
  };
  testResults: Array<{
    verdict: string;
    executionTimeMs: number;
    memoryUsedKb: number;
    actualStdout: string | null;
    diffLog: string | null;
    testCase: { label: string; rationaleTag: string };
  }>;
}

export interface IRagContextRepository {
  findSubmissionContext(submissionId: string): Promise<RagSubmissionData | null>;
}
