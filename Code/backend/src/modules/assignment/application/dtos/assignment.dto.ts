import { z } from 'zod';

export const CreateAssignmentSchema = z.object({
  courseId: z.string().uuid('ID khóa học phải là UUID hợp lệ'),
  title: z.string().min(2, 'Tiêu đề đề thi tối thiểu 2 ký tự').max(255),
  description: z.string().optional(),
  environment: z.enum(['C_GCC', 'JAVA_JDK'], {
    required_error: 'Vui lòng chọn môi trường biên dịch: C_GCC hoặc JAVA_JDK',
  }),
  submissionType: z.enum(['INDIVIDUAL', 'GROUP']).default('INDIVIDUAL'),
  startTime: z.coerce.date().default(() => new Date()),
  deadline: z.coerce.date(),
  durationMinutes: z.coerce.number().int().positive().default(90),
  accessCode: z.string().max(50).optional().nullable(),
  allowGitSubmission: z.boolean().default(true),
  allowZipSubmission: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
});

export type CreateAssignmentDto = z.infer<typeof CreateAssignmentSchema>;

export const UpdateAssignmentSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  environment: z.enum(['C_GCC', 'JAVA_JDK']).optional(),
  submissionType: z.enum(['INDIVIDUAL', 'GROUP']).optional(),
  startTime: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  accessCode: z.string().max(50).optional().nullable(),
  allowGitSubmission: z.boolean().optional(),
  allowZipSubmission: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
});

export type UpdateAssignmentDto = z.infer<typeof UpdateAssignmentSchema>;

export const CreateTestCaseSchema = z.object({
  label: z.string().min(1, 'Tên nhãn testcase không được để trống'),
  rationaleTag: z.enum(['FUNCTIONAL', 'BOUNDARY', 'EDGE', 'PERFORMANCE', 'SECURITY']).default('FUNCTIONAL'),
  isHidden: z.boolean().default(false),
  timeLimitMs: z.number().int().positive().default(2000),
  memoryLimitKb: z.number().int().positive().default(262144),
  points: z.number().positive().default(1.0),
  comparisonMode: z.enum(['STDIO', 'FILE_TO_FILE']).default('STDIO'),
  stdinInput: z.string().optional().nullable(),
  expectedStdout: z.string().optional().nullable(),
  inputFileName: z.string().optional().nullable(),
  inputFileContent: z.string().optional().nullable(),
  expectedFileName: z.string().optional().nullable(),
  expectedFileContent: z.string().optional().nullable(),
  paperCode: z.string().max(50).optional().nullable(),
  orderIndex: z.number().int().default(1),
});

export type CreateTestCaseDto = z.infer<typeof CreateTestCaseSchema>;

export const SetRubricRulesSchema = z.object({
  rules: z.array(
    z.object({
      criterionName: z.string().min(1, 'Tên tiêu chí không được rỗng'),
      description: z.string().min(1, 'Mô tả tiêu chí không được rỗng'),
      maxPoints: z.number().positive(),
      weight: z.number().default(1.0),
      orderIndex: z.number().int().default(1),
    })
  ).min(1, 'Danh sách Rubrics không được để trống'),
});

export type SetRubricRulesDto = z.infer<typeof SetRubricRulesSchema>;

export const UpsertSolutionSchema = z.object({
  title: z.string().min(1, 'Tiêu đề đáp án mẫu không được rỗng'),
  sourceCode: z.string().min(1, 'Mã nguồn đáp án mẫu không được rỗng'),
  explanation: z.string().optional(),
});

export type UpsertSolutionDto = z.infer<typeof UpsertSolutionSchema>;
