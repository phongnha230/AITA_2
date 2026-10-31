import { z } from 'zod';

export const sandboxTestCaseSchema = z.object({
  id: z.string().max(100).optional(),
  questionNo: z.string().max(50).optional(),
  inputData: z.string().default(''),
  expectedOutput: z.string().default(''),
  outputFileName: z.string().max(255).nullable().optional(),
  timeLimitMs: z.coerce.number().int().min(100).max(10_000),
  memoryLimitMb: z.coerce.number().int().min(32).max(512),
  score: z.coerce.number().finite().min(0).max(100),
});

export const executeSandboxSchema = z.object({
  language: z.enum(['C', 'CPP', 'PRF192', 'C_GCC', 'JAVA', 'PRO192', 'CSD201']).default('JAVA'),
  sourceCode: z.string().min(1).max(1024 * 1024),
  fileName: z.string().max(255).optional(),
  testCases: z.array(sandboxTestCaseSchema).min(1).max(100),
});

export type ExecuteSandboxInput = z.infer<typeof executeSandboxSchema>;

export const instructorDryRunSchema = z.object({
  courseId: z.string().uuid(),
  language: z.enum(['C_GCC', 'JAVA_JDK', 'REACT_JS']),
  previewDeploymentUrl: z.string().url().max(1000).optional(),
  referenceRepositoryUrl: z.string().url().max(1000).optional(),
  sourceCode: z.string().min(1).max(1024 * 1024).optional(),
  sourceFiles: z.array(z.object({
    path: z.string().min(1).max(255),
    content: z.string().max(10 * 1024 * 1024),
    encoding: z.enum(['utf8', 'base64']).optional(),
  })).min(1).max(100).optional(),
  testCases: z.array(z.object({
    id: z.string().max(100).optional(),
    questionNo: z.string().max(50).optional(),
    stdinInput: z.string().optional().nullable(),
    expectedStdout: z.string().optional().nullable(),
    inputFileContent: z.string().optional().nullable(),
    expectedFileName: z.string().max(255).optional().nullable(),
    expectedFileContent: z.string().optional().nullable(),
    comparisonMode: z.enum(['STDIO', 'FILE_TO_FILE']).default('STDIO'),
    timeLimitMs: z.coerce.number().int().min(100).max(60_000),
    memoryLimitKb: z.coerce.number().int().min(32_768).max(524_288),
    points: z.coerce.number().finite().min(0).max(100),
    isHarness: z.boolean().optional(),
    kind: z.string().optional(),
  })).min(1).max(100),
}).refine((input) => {
  if (input.language === 'REACT_JS') {
    return Boolean(input.previewDeploymentUrl && input.previewDeploymentUrl.trim());
  }
  return Boolean(input.sourceCode || input.sourceFiles?.length);
}, {
  message: 'Cần cung cấp mã nguồn (cho C/Java) hoặc previewDeploymentUrl (cho React).',
  path: ['sourceCode'],
});

export type InstructorDryRunInput = z.infer<typeof instructorDryRunSchema>;
