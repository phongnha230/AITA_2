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
