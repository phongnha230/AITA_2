import { z } from 'zod';

export const GradeSubmissionAiSchema = z.object({
  submissionId: z.string().uuid({ message: 'submissionId phải là UUID hợp lệ' }),
});

export type GradeSubmissionAiInput = z.infer<typeof GradeSubmissionAiSchema>;
