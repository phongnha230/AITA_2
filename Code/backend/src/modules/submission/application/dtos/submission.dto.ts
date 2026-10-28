import { z } from 'zod';

export const SubmitAssignmentSchema = z
  .object({
    assignmentId: z.string().uuid({ message: 'assignmentId phải là UUID hợp lệ' }),
    groupLabel: z.string().max(50).optional(),
    paperCode: z.string().max(50).optional(),
    accessCode: z.string().max(50).optional(),
    submissionChannel: z.enum(['ZIP_UPLOAD', 'GIT_COMMIT'], {
      message: "submissionChannel phải là 'ZIP_UPLOAD' hoặc 'GIT_COMMIT'",
    }),
    gitRepoUrl: z.string().url('gitRepoUrl phải là một URL hợp lệ').optional(),
    gitCommitHash: z.string().regex(/^[a-f0-9]{7,40}$/i, 'gitCommitHash không hợp lệ').optional(),
    deployedUrl: z.string().url('deployedUrl phải là một URL hợp lệ').optional(),
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
    }
  });

export const SubmitTeamAssignmentSchema = z.object({
  teamId: z.string().uuid('teamId phải là UUID hợp lệ'),
  gitCommitHash: z.string().regex(/^[a-f0-9]{7,40}$/i, 'gitCommitHash không hợp lệ').optional(),
});

export const AdjustParticipantScoreSchema = z.object({
  adjustedScore: z.number().finite().min(0).max(10).nullable(),
  reason: z.string().trim().min(5).max(500),
});

export const ReviewGradingRunSchema = z.object({
  finalScore: z.number().finite().min(0).max(10).optional(),
  reviewNote: z.string().trim().min(5).max(2_000),
});
export type ReviewGradingRunDto = z.infer<typeof ReviewGradingRunSchema>;

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentSchema>;
export type SubmitTeamAssignmentInput = z.infer<typeof SubmitTeamAssignmentSchema>;
export type AdjustParticipantScoreInput = z.infer<typeof AdjustParticipantScoreSchema>;

export const GetSubmissionStatusSchema = z.object({
  id: z.string().uuid({ message: 'submissionId phải là UUID hợp lệ' }),
});

export type GetSubmissionStatusInput = z.infer<typeof GetSubmissionStatusSchema>;
