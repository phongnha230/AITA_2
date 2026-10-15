import { GoogleGenAI } from '@google/genai';
import { env } from '../../../../infrastructure/config/env.js';
import { IEmbeddingProvider } from '../../application/services/embedding-provider.interface.js';
import { IGeminiCredentialPool } from '../../application/services/gemini-credential-pool.interface.js';

const EMBEDDING_DIMENSION = 768;

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  constructor(private readonly credentialPool: IGeminiCredentialPool) {}

  private async embed(
    contents: string[],
    operation: 'DOCUMENT_EMBEDDING' | 'QUERY_EMBEDDING',
    taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'
  ): Promise<number[][]> {
    return this.credentialPool.execute(operation, async (apiKey) => {
      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.embedContent({
        model: env.GEMINI_EMBEDDING_MODEL,
        contents,
        config: {
          taskType,
          outputDimensionality: EMBEDDING_DIMENSION,
        },
      });
      const embeddings = response.embeddings?.map((item) => item.values ?? []);
      if (
        !embeddings ||
        embeddings.length !== contents.length ||
        embeddings.some((item) => item.length !== EMBEDDING_DIMENSION)
      ) {
        throw new Error('Gemini returned invalid RAG embeddings.');
      }
      return embeddings;
    });
  }

  public embedDocuments(contents: string[]): Promise<number[][]> {
    return this.embed(contents, 'DOCUMENT_EMBEDDING', 'RETRIEVAL_DOCUMENT');
  }

  public async embedQuery(content: string): Promise<number[]> {
    const [embedding] = await this.embed([content], 'QUERY_EMBEDDING', 'RETRIEVAL_QUERY');
    return embedding;
  }
}
