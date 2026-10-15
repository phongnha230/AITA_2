import { describe, expect, it } from 'vitest';
import { ValidationError } from '../../src/shared/domain/exceptions/app.error.js';
import { RubricGradingPrompt } from '../../src/modules/ai/infrastructure/prompts/rubric-grading.prompt.js';
import { RagContext } from '../../src/modules/ai/application/services/rag-knowledge.service.interface.js';

const createContext = (environment: 'C_GCC' | 'JAVA_JDK', courseCode: string | null = null): RagContext => ({
  assignmentTitle: 'Algorithm assignment',
  assignmentDescription: 'Implement a solution with the expected complexity.',
  environment,
  courseCode,
  javaGradingProfile: courseCode === 'PRO192' ? 'PRO_OOP' : courseCode === 'CSD201' ? 'CSD_ALGORITHM' : environment === 'JAVA_JDK' ? 'JAVA_GENERAL' : null,
  algorithmSpecification: {
    expectedTimeComplexity: 'O(n log n)',
    expectedSpaceComplexity: 'O(n)',
    acceptedStrategies: ['merge sort', 'heap sort'],
    notes: 'Equivalent correct strategies are accepted.',
  },
  referenceSolutionSource: 'private reference source',
  relevantSolutionChunks: [{
    id: 'chunk-1',
    symbol: 'solve',
    file: environment === 'C_GCC' ? 'main.c' : 'Main.java',
    code: 'reference chunk',
    startLine: 1,
    endLine: 4,
    similarity: 0.9,
    embeddingModel: 'test-embedding-model',
    chunkerVersion: 'test-chunker',
    chunkType: 'FUNCTION',
  }],
  rubricRules: [{
    id: 'rubric-1',
    criterionName: 'Algorithm quality',
    description: 'Use a suitable algorithm.',
    maxPoints: 1,
    weight: 1,
    criterionType: 'ALGORITHM',
  }],
  failedTestCases: [],
  testPerformance: [],
});

describe('language-specific AI grading prompts', () => {
  it('selects a C-specific system and user template', () => {
    const context = createContext('C_GCC');
    const system = RubricGradingPrompt.buildSystemInstruction(context.environment);
    const prompt = RubricGradingPrompt.buildUserPrompt('int main(void) { return 0; }', context);

    expect(system).toContain('chuyên cho bài lập trình C');
    expect(system).toContain('con trỏ');
    expect(system).not.toContain('Collections');
    expect(prompt).toContain('<UNTRUSTED_C_SOURCE>');
    expect(prompt).toContain('"language":"C_GCC"');
    expect(prompt).not.toContain('<UNTRUSTED_JAVA_SOURCE>');
  });

  it('selects a Java-specific system and user template', () => {
    const context = createContext('JAVA_JDK', 'PRO192');
    const system = RubricGradingPrompt.buildSystemInstruction(context.environment);
    const prompt = RubricGradingPrompt.buildUserPrompt('class Main {}', context);

    expect(system).toContain('chuyên cho bài lập trình Java JDK 17');
    expect(system).toContain('Java');
    expect(system).not.toContain('con trỏ');
    expect(prompt).toContain('<UNTRUSTED_JAVA_SOURCE>');
    expect(prompt).toContain('"language":"JAVA_JDK"');
    expect(prompt).toContain('"gradingProfile":"PRO_OOP"');
    expect(prompt).not.toContain('<UNTRUSTED_C_SOURCE>');
  });

  it('includes course-specific RAG context and sandbox performance as supporting evidence', () => {
    const context = createContext('JAVA_JDK', 'CSD201');
    context.testPerformance.push({
      label: 'large-input',
      rationaleTag: 'PERFORMANCE',
      verdict: 'PASSED',
      executionTimeMs: 17,
      memoryUsedKb: 2048,
    });

    const prompt = RubricGradingPrompt.buildUserPrompt('class Main {}', context);

    expect(prompt).toContain('"courseCode":"CSD201"');
    expect(prompt).toContain('"gradingProfile":"CSD_ALGORITHM"');
    expect(prompt).toContain('<UNTRUSTED_JAVA_TEST_PERFORMANCE>');
    expect(prompt).toContain('"executionTimeMs":17');
  });

  it('fails closed for a language without an AI grading strategy', () => {
    expect(() => RubricGradingPrompt.buildSystemInstruction('PYTHON'))
      .toThrow(ValidationError);
  });

  it('uses separate PRO192 and CSD201 evaluation focus while preserving the common output contract', () => {
    const proSystem = RubricGradingPrompt.buildSystemInstruction('JAVA_JDK', false, ' PRO192 ');
    const csdSystem = RubricGradingPrompt.buildSystemInstruction('JAVA_JDK', false, 'csd201');
    const generalSystem = RubricGradingPrompt.buildSystemInstruction('JAVA_JDK', false, 'SWD392');

    expect(proSystem).toContain('Profile PRO192');
    expect(proSystem).toContain('encapsulation');
    expect(csdSystem).toContain('Profile CSD201');
    expect(csdSystem).toContain('cấu trúc dữ liệu');
    expect(csdSystem).not.toContain('Profile PRO192');
    expect(generalSystem).toContain('Profile Java chung');
    expect(proSystem).toContain('{"rubricBreakdown"');
    expect(csdSystem).toContain('{"rubricBreakdown"');
    expect(proSystem).toContain('Không tự tạo rubricId');
    expect(csdSystem).toContain('Không tự tạo rubricId');
  });
});
