import { z } from 'zod';

export const SubmitAssignmentSchema = z
  .object({
    assignmentId: z.string().uuid({ message: 'assignmentId phải là UUID hợp lệ' }),
    groupLabel: z.string().max(50).optional(),
    paperCode: z.string().max(50).optional(),
    accessCode: z.string().max(50).optional(),
    submissionChannel: z.enum(['ZIP_UPLOAD', 'GIT_COMMIT'], {
      errorMap: () => ({ message: "submissionChannel phải là 'ZIP_UPLOAD' hoặc 'GIT_COMMIT'" }),
    }),
    gitRepoUrl: z.string().url('gitRepoUrl phải là một URL hợp lệ').optional(),
    gitCommitHash: z.string().min(7, 'gitCommitHash không hợp lệ').max(64).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.submissionChannel === 'GIT_COMMIT') {
      if (!data.gitRepoUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'gitRepoUrl là bắt buộc khi submissionChannel = GIT_COMMIT',
          path: ['gitRepoUrl'],
        });
      }
      if (!data.gitCommitHash) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'gitCommitHash là bắt buộc khi submissionChannel = GIT_COMMIT',
          path: ['gitCommitHash'],
        });
      }
    }
  });

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentSchema>;

export const GetSubmissionStatusSchema = z.object({
  id: z.string().uuid({ message: 'submissionId phải là UUID hợp lệ' }),
});

export type GetSubmissionStatusInput = z.infer<typeof GetSubmissionStatusSchema>;
