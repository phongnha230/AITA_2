export type GeminiOperation =
  | 'CHAT_GENERATION'
  | 'GRADING_GENERATION'
  | 'DOCUMENT_EMBEDDING'
  | 'QUERY_EMBEDDING';

export interface IGeminiCredentialPool {
  execute<T>(operation: GeminiOperation, handler: (apiKey: string) => Promise<T>): Promise<T>;
}
