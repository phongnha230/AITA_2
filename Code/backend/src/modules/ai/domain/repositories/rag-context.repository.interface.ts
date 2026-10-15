export interface RagSubmissionData {
  compileOutput: string | null;
  assignment: {
    id: string;
    title: string;
    description: string | null;
    environment: string;
    rubricRules: Array<{
      id: string;
      criterionName: string;
      description: string;
      maxPoints: number;
      weight: number;
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
    } | null;
  };
  testResults: Array<{
    verdict: string;
    actualStdout: string | null;
    diffLog: string | null;
    testCase: { label: string; rationaleTag: string };
  }>;
}

export interface IRagContextRepository {
  findSubmissionContext(submissionId: string): Promise<RagSubmissionData | null>;
}
