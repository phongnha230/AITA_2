import { z } from 'zod';

export const UpdateAiTutorConfigSchema = z.object({
  socraticMode: z.enum(['STRICT', 'BALANCED', 'LENIENT']),
  customPrompt: z.string().max(4_000),
  temperature: z.number().min(0.1).max(0.8),
  enableContext: z.boolean(),
}).strict();

export type UpdateAiTutorConfigInput = z.infer<typeof UpdateAiTutorConfigSchema>;
