import { describe, expect, it } from 'vitest';
import {
  GeminiOperation,
  IGeminiCredentialPool,
} from '../../src/modules/ai/application/services/gemini-credential-pool.interface.js';
import { GeminiEmbeddingProvider } from '../../src/modules/ai/infrastructure/embedding/gemini-embedding.provider.js';

class RecordingPool implements IGeminiCredentialPool {
  public operations: GeminiOperation[] = [];
  async execute<T>(operation: GeminiOperation): Promise<T> {
    this.operations.push(operation);
    const value = operation === 'DOCUMENT_EMBEDDING'
      ? [[1, 2], [3, 4]]
      : [[5, 6]];
    return value as T;
  }
}

describe('GeminiEmbeddingProvider', () => {
  it('routes document and query embeddings through the shared credential pool', async () => {
    const pool = new RecordingPool();
    const provider = new GeminiEmbeddingProvider(pool);
    await expect(provider.embedDocuments(['a', 'b'])).resolves.toEqual([[1, 2], [3, 4]]);
    await expect(provider.embedQuery('query')).resolves.toEqual([5, 6]);
    expect(pool.operations).toEqual(['DOCUMENT_EMBEDDING', 'QUERY_EMBEDDING']);
  });
});
