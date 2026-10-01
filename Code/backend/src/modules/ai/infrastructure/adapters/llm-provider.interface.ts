export interface LlmGenerateOptions {
  apiKey: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}

export interface LlmResponse {
  text: string;
  tokensConsumed?: number;
}

export interface ILlmProvider {
  generateContent(prompt: string, options: LlmGenerateOptions): Promise<LlmResponse>;
}
