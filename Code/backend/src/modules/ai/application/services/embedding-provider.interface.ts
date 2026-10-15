export interface IEmbeddingProvider {
  embedDocuments(contents: string[]): Promise<number[][]>;
  embedQuery(content: string): Promise<number[]>;
}
