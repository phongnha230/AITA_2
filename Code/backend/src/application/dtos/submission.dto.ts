import { z } from 'zod';

export const SubmitAssignmentSchema = z
  .object({
    assignmentId: z.string().uuid({ message: 'assignmentId phải là UUID hợp lệ' }),
    teamId: z.string().uuid({ message: 'teamId phải là UUID hợp lệ' }).optional(),
    submissionType: z.enum(['ZIP_FILE', 'GIT_REPO'], {
      errorMap: () => ({ message: "submissionType phải là 'ZIP_FILE' hoặc 'GIT_REPO'" }),
    }),
    gitCommitHash: z.string().min(7, 'gitCommitHash không hợp lệ').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.submissionType === 'GIT_REPO' && !data.gitCommitHash) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'gitCommitHash là bắt buộc khi submissionType = GIT_REPO',
        path: ['gitCommitHash'],
      });
    }
  });

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentSchema>;

export const GetSubmissionStatusSchema = z.object({
  id: z.string().uuid({ message: 'submissionId phải là UUID hợp lệ' }),
});

export type GetSubmissionStatusInput = z.infer<typeof GetSubmissionStatusSchema>;
