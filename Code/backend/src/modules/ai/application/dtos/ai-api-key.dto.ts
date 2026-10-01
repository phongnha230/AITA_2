import { z } from 'zod';

export const CreateAiApiKeySchema = z.object({
  provider: z.enum(['GEMINI', 'OPENAI'], {
    errorMap: () => ({ message: "provider phải là 'GEMINI' hoặc 'OPENAI'" }),
  }),
  keyAlias: z.string().min(1, 'keyAlias không được để trống').max(100),
  rawApiKey: z.string().min(10, 'rawApiKey không hợp lệ'),
  dailyRequestLimit: z.number().int().positive().default(1500),
  rpmLimit: z.number().int().positive().default(60),
});

export type CreateAiApiKeyInput = z.infer<typeof CreateAiApiKeySchema>;
