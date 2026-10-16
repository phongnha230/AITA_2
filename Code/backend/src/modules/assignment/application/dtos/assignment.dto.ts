import { z } from 'zod';

export const CreateAssignmentSchema = z.object({
  courseId: z.string().uuid('ID khóa học phải là UUID hợp lệ'),
  title: z.string().min(2, 'Tiêu đề đề thi tối thiểu 2 ký tự').max(255),
  description: z.string().optional(),
  environment: z.enum(['C_GCC', 'JAVA_JDK', 'REACT_JS'], {
    required_error: 'Vui lòng chọn môi trường: C_GCC, JAVA_JDK hoặc REACT_JS',
  }),
  submissionType: z.enum(['INDIVIDUAL', 'GROUP']).default('INDIVIDUAL'),
  startTime: z.coerce.date().default(() => new Date()),
  deadline: z.coerce.date(),
  durationMinutes: z.coerce.number().int().positive().default(90),
  accessCode: z.string().trim().min(4, 'Mã đề tối thiểu 4 ký tự').max(50),
  allowGitSubmission: z.boolean().default(true),
  allowZipSubmission: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
  gradingVersion: z.number().int().min(1).max(2).optional(),
  functionalMaxScore: z.number().finite().positive().optional(),
  algorithmMaxScore: z.number().finite().min(0).optional(),
  cleanCodeMaxScore: z.number().finite().min(0).optional(),
}).transform((assignment) => {
  const isReact = assignment.environment === 'REACT_JS';
  return {
    ...assignment,
    gradingVersion: assignment.gradingVersion ?? (isReact ? 2 : 1),
    functionalMaxScore: assignment.functionalMaxScore ?? (isReact ? 7 : 8),
    algorithmMaxScore: assignment.algorithmMaxScore ?? 2,
    cleanCodeMaxScore: assignment.cleanCodeMaxScore ?? (isReact ? 1 : 0),
  };
}).refine(
  (assignment) => Math.abs(
    assignment.functionalMaxScore + assignment.algorithmMaxScore + assignment.cleanCodeMaxScore - 10
  ) < 0.001,
  { message: 'Tổng điểm các phần phải bằng 10.' }
).refine(
  (assignment) => assignment.gradingVersion !== 2 || (
    assignment.functionalMaxScore === 7
    && assignment.algorithmMaxScore === 2
    && assignment.cleanCodeMaxScore === 1
  ),
  { message: 'Cấu hình chấm phiên bản 2 phải là 7 điểm chức năng, 2 điểm thuật toán và 1 điểm Clean Code.' }
);

export type CreateAssignmentDto = z.infer<typeof CreateAssignmentSchema>;

export const UpdateAssignmentSchema = z.object({
  title: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  environment: z.enum(['C_GCC', 'JAVA_JDK', 'REACT_JS']).optional(),
  submissionType: z.enum(['INDIVIDUAL', 'GROUP']).optional(),
  startTime: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  accessCode: z.string().trim().min(4, 'Mã đề tối thiểu 4 ký tự').optional(),
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
      criterionType: z.enum(['GENERAL', 'ALGORITHM', 'CLEAN_CODE']).default('GENERAL'),
    })
  ).min(1, 'Danh sách Rubrics không được để trống'),
});

export type SetRubricRulesDto = z.infer<typeof SetRubricRulesSchema>;

export const UpsertSolutionSchema = z.object({
  title: z.string().min(1, 'Tiêu đề đáp án mẫu không được rỗng'),
  sourceCode: z.string().min(1, 'Mã nguồn đáp án mẫu không được rỗng'),
  explanation: z.string().optional(),
  expectedTimeComplexity: z.string().trim().max(100).optional(),
  expectedSpaceComplexity: z.string().trim().max(100).optional(),
  acceptedStrategies: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  algorithmNotes: z.string().trim().max(4_000).optional(),
});

export type UpsertSolutionDto = z.infer<typeof UpsertSolutionSchema>;

export const SaveAssignmentPackageSchema = z.object({
  assignment: CreateAssignmentSchema,
  testCases: z.array(CreateTestCaseSchema).min(1).max(100),
  rubricRules: SetRubricRulesSchema.shape.rules,
  solution: UpsertSolutionSchema.optional(),
  removeSolution: z.boolean().default(false),
  removePdf: z.boolean().default(false),
  removeStarter: z.boolean().default(false),
});

export type SaveAssignmentPackageDto = z.infer<typeof SaveAssignmentPackageSchema>;

export const ControlSessionSchema = z.object({
  action: z.enum(['EXTEND', 'CLOSE', 'START', 'PAUSE', 'RESUME'], {
    required_error: 'Hành động điều khiển ca thi không hợp lệ.',
  }),
  extraMinutes: z.coerce.number().int().positive().optional(),
});

export type ControlSessionDto = z.infer<typeof ControlSessionSchema>;

export const UnlockExamSchema = z.object({
  accessCode: z.string().trim().min(1, 'Vui lòng nhập mã đề').max(50),
});
export type UnlockExamDto = z.infer<typeof UnlockExamSchema>;

