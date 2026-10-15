import { z } from 'zod';

export const CreateAiApiKeySchema = z.object({
  provider: z.literal('GEMINI', {
    errorMap: () => ({ message: "Gemini credential pool chỉ chấp nhận provider 'GEMINI'" }),
  }),
  keyAlias: z.string().min(1, 'keyAlias không được để trống').max(100),
  rawApiKey: z.string().min(10, 'rawApiKey không hợp lệ'),
  dailyRequestLimit: z.number().int().positive().default(1500),
  rpmLimit: z.number().int().positive().default(60),
});

export type CreateAiApiKeyInput = z.infer<typeof CreateAiApiKeySchema>;
