import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILlmProvider, LlmGenerateOptions, LlmResponse } from './llm-provider.interface.js';

export class GeminiAdapter implements ILlmProvider {
  async generateContent(prompt: string, options: LlmGenerateOptions): Promise<LlmResponse> {
    const genAI = new GoogleGenerativeAI(options.apiKey);
    const modelName = 'gemini-1.5-flash';

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: options.systemInstruction,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        responseMimeType: options.jsonMode ? 'application/json' : 'text/plain',
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const usage = response.usageMetadata;
    const tokensConsumed = usage ? usage.totalTokenCount : 0;

    return {
      text,
      tokensConsumed,
    };
  }
}
