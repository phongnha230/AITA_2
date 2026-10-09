import { z } from 'zod';

export const StartTutorConversationSchema = z.object({
  submissionId: z.string().uuid({ message: 'submissionId phải là UUID hợp lệ' }).optional(),
  title: z.string().max(255).optional(),
});

export type StartTutorConversationInput = z.infer<typeof StartTutorConversationSchema>;

export const SendTutorMessageSchema = z.object({
  content: z.string().min(1, 'Nội dung câu hỏi không được để trống').max(4000),
});

export type SendTutorMessageInput = z.infer<typeof SendTutorMessageSchema>;
