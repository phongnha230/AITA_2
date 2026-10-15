import { GoogleGenAI } from '@google/genai';
import { env } from '../../../../infrastructure/config/env.js';
import { ILlmProvider, LlmGenerateOptions, LlmResponse } from './llm-provider.interface.js';

export class GeminiAdapter implements ILlmProvider {
  async generateContent(prompt: string, options: LlmGenerateOptions): Promise<LlmResponse> {
    const client = new GoogleGenAI({ apiKey: options.apiKey });
    const response = await client.models.generateContent({
      model: env.GEMINI_GENERATION_MODEL,
      contents: prompt,
      config: {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 2_048,
        responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
      },
    });

    const text = response.text;
    if (!text) throw new Error('Gemini returned an empty response.');
    return {
      text,
      tokensConsumed: response.usageMetadata?.totalTokenCount ?? 0,
    };
  }
}
