import { afterEach, describe, expect, it, vi } from 'vitest';
import { env } from '../../src/infrastructure/config/env.js';
import { IRagContextRepository, RagSubmissionData } from '../../src/modules/ai/domain/repositories/rag-context.repository.interface.js';
import { CHUNKER_VERSION } from '../../src/modules/ai/infrastructure/chunking/code-chunker.js';
import { RagKnowledgeFacade } from '../../src/modules/ai/infrastructure/facades/rag-knowledge.facade.js';
import { ISolutionVectorStore } from '../../src/modules/ai/infrastructure/vector/chroma-vector.service.js';

const previousRagRequirement = env.AI_GRADING_REQUIRE_READY_RAG;

afterEach(() => {
  env.AI_GRADING_REQUIRE_READY_RAG = previousRagRequirement;
});

describe('RAG Java course profile integration', () => {
  it('carries course, rubric, solution notes, retrieval query, and runtime observations into grading context', async () => {
    env.AI_GRADING_REQUIRE_READY_RAG = true;
    const submissionContext: RagSubmissionData = {
      compileOutput: null,
      assignment: {
        id: 'assignment-csd',
        title: 'Sort a sequence',
        description: 'Sort integers efficiently.',
        environment: 'JAVA_JDK',
        courseCode: 'CSD201',
        rubricRules: [{
          id: 'algorithm-rubric',
          criterionName: 'Algorithm',
          description: 'Use the required complexity.',
          maxPoints: 2,
          weight: 1,
          criterionType: 'ALGORITHM',
        }],
        activeSolution: {
          id: 'solution-csd',
          assignmentId: 'assignment-csd',
          activeKey: 'assignment-csd',
          contentHash: 'content-hash',
          indexStatus: 'READY',
          embeddingModel: env.GEMINI_EMBEDDING_MODEL,
          chunkerVersion: CHUNKER_VERSION,
          sourceCode: 'private reference source',
          expectedTimeComplexity: 'O(n log n)',
          expectedSpaceComplexity: 'O(n)',
          acceptedStrategies: ['merge sort', 'heap sort'],
          algorithmNotes: 'Accept equivalent strategies; assess data structure choices.',
        },
      },
      testResults: [{
        verdict: 'PASSED',
        executionTimeMs: 21,
        memoryUsedKb: 1024,
        actualStdout: '1 2 3',
        diffLog: null,
        testCase: { label: 'large-sequence', rationaleTag: 'PERFORMANCE' },
      }],
    };
    const findSubmissionContext = vi.fn().mockResolvedValue(submissionContext);
    const queryRelevantChunks = vi.fn(async (_filter: unknown, _query: string) => [{
      id: 'chunk-csd',
      symbol: 'sort',
      file: 'IntegerSorter.java',
      code: 'reference chunk',
      startLine: 1,
      endLine: 4,
      similarity: 0.88,
      embeddingModel: env.GEMINI_EMBEDDING_MODEL,
      chunkerVersion: CHUNKER_VERSION,
      chunkType: 'METHOD',
    }]);
    const facade = new RagKnowledgeFacade(
      { findSubmissionContext } as unknown as IRagContextRepository,
      { queryRelevantChunks } as unknown as ISolutionVectorStore
    );

    const context = await facade.getGradingContext('submission-csd', 'class Main {}');
    const vectorQuery = queryRelevantChunks.mock.calls[0]?.[1] as string;

    expect(context.courseCode).toBe('CSD201');
    expect(context.javaGradingProfile).toBe('CSD_ALGORITHM');
    expect(context.rubricRules[0]?.criterionType).toBe('ALGORITHM');
    expect(context.algorithmSpecification.notes).toContain('data structure');
    expect(context.testPerformance[0]).toMatchObject({ executionTimeMs: 21, memoryUsedKb: 1024 });
    expect(vectorQuery).toContain('CSD_ALGORITHM');
    expect(vectorQuery).toContain('O(n log n)');
    expect(vectorQuery).toContain('Accept equivalent strategies');
    expect(queryRelevantChunks).toHaveBeenCalledWith(expect.objectContaining({
      assignmentId: 'assignment-csd',
      solutionId: 'solution-csd',
    }), expect.any(String));
  });

  it('builds FER201 context without a reference solution, vector search, or ready-RAG flag', async () => {
    env.AI_GRADING_REQUIRE_READY_RAG = false;
    const submissionContext: RagSubmissionData = {
      compileOutput: null,
      assignment: {
        id: 'assignment-react',
        title: 'FER201 storefront',
        description: 'Test the deployed storefront.',
        environment: 'REACT_JS',
        courseCode: 'FER201',
        rubricRules: [
          {
            id: 'structure',
            criterionName: 'Cấu trúc & kiến trúc React',
            description: 'Hooks, state and component boundaries.',
            maxPoints: 2,
            weight: 1,
            criterionType: 'ALGORITHM',
          },
          {
            id: 'clean-code',
            criterionName: 'Clean Code React',
            description: 'Naming and maintainability.',
            maxPoints: 1,
            weight: 1,
            criterionType: 'CLEAN_CODE',
          },
        ],
        activeSolution: null,
      },
      testResults: [{
        verdict: 'WRONG_ANSWER',
        executionTimeMs: 320,
        memoryUsedKb: 45_000,
        actualStdout: 'Login button was not visible',
        diffLog: null,
        testCase: { label: 'Login flow', rationaleTag: 'FUNCTIONAL' },
      }],
    };
    const queryRelevantChunks = vi.fn();
    const facade = new RagKnowledgeFacade(
      { findSubmissionContext: vi.fn().mockResolvedValue(submissionContext) } as unknown as IRagContextRepository,
      { queryRelevantChunks } as unknown as ISolutionVectorStore
    );

    const context = await facade.getGradingContext('submission-react', '// selected React source');

    expect(context.referenceSolutionSource).toBe('');
    expect(context.relevantSolutionChunks).toEqual([]);
    expect(context.rubricRules.map((rule) => rule.maxPoints)).toEqual([2, 1]);
    expect(context.failedTestCases[0]?.label).toBe('Login flow');
    expect(queryRelevantChunks).not.toHaveBeenCalled();
  });
});
