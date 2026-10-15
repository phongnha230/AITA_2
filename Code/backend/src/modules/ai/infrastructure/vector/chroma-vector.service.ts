import { ChromaClient, Collection } from 'chromadb';
import { env } from '../../../../infrastructure/config/env.js';
import { IEmbeddingProvider } from '../../application/services/embedding-provider.interface.js';
import { CodeChunk } from '../chunking/code-chunker.js';

const COLLECTION_NAME = 'aita_solution_code_chunks_v2';

export interface SolutionVectorVersion {
  assignmentId: string;
  solutionId: string;
  contentHash: string;
  environment: string;
  embeddingModel: string;
  chunkerVersion: string;
}

export interface RetrievedSolutionChunk {
  id: string;
  symbol: string;
  file: string;
  code: string;
  startLine: number;
  endLine: number;
  similarity: number;
  embeddingModel: string;
  chunkerVersion: string;
  chunkType: string;
}

export interface ISolutionVectorStore {
  indexSolutionVersion(version: SolutionVectorVersion, chunks: CodeChunk[]): Promise<void>;
  deleteStaleVersions(assignmentId: string, currentContentHash: string): Promise<void>;
  deleteAssignment(assignmentId: string): Promise<void>;
  queryRelevantChunks(version: SolutionVectorVersion, queryText: string): Promise<RetrievedSolutionChunk[]>;
}

export class ChromaVectorService implements ISolutionVectorStore {
  private readonly client: ChromaClient;
  private collection: Collection | null = null;

  constructor(private readonly embeddingProvider: IEmbeddingProvider) {
    this.client = new ChromaClient({ path: env.CHROMA_DB_URL });
  }

  private async getCollection(): Promise<Collection> {
    if (this.collection) return this.collection;
    this.collection = await this.client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: {
        description: 'AITA solution code chunks v2',
        'hnsw:space': 'cosine',
      },
    });
    return this.collection;
  }

  public async indexSolutionVersion(
    version: SolutionVectorVersion,
    chunks: CodeChunk[]
  ): Promise<void> {
    if (chunks.length === 0) throw new Error('Cannot index an empty solution.');
    const collection = await this.getCollection();
    const documents = chunks.map(
      (chunk) => `File: ${chunk.file}\nSymbol: ${chunk.name}\nLines: ${chunk.startLine}-${chunk.endLine}\n${chunk.code}`
    );
    const embeddings = await this.embeddingProvider.embedDocuments(
      documents.map((document) => document.slice(0, 8_192))
    );
    await collection.upsert({
      ids: chunks.map((chunk) => `${version.solutionId}:${version.contentHash}:${chunk.id}`),
      embeddings,
      documents,
      metadatas: chunks.map((chunk) => ({
        assignmentId: version.assignmentId,
        solutionId: version.solutionId,
        contentHash: version.contentHash,
        environment: version.environment,
        file: chunk.file,
        symbol: chunk.name,
        chunkType: chunk.type,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        embeddingModel: version.embeddingModel,
        chunkerVersion: version.chunkerVersion,
      })),
    });
  }

  public async deleteStaleVersions(assignmentId: string, currentContentHash: string): Promise<void> {
    const collection = await this.getCollection();
    const existing = await collection.get({
      where: { assignmentId: { $eq: assignmentId } },
      include: ['metadatas'],
    });
    const staleIds = existing.ids.filter(
      (_id, index) => existing.metadatas?.[index]?.contentHash !== currentContentHash
    );
    if (staleIds.length > 0) await collection.delete({ ids: staleIds });
  }

  public async deleteAssignment(assignmentId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.delete({ where: { assignmentId: { $eq: assignmentId } } });
  }

  public async queryRelevantChunks(
    version: SolutionVectorVersion,
    queryText: string
  ): Promise<RetrievedSolutionChunk[]> {
    const collection = await this.getCollection();
    const queryEmbedding = await this.embeddingProvider.embedQuery(queryText.slice(0, 8_192));
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 8,
      where: {
        $and: [
          { assignmentId: { $eq: version.assignmentId } },
          { solutionId: { $eq: version.solutionId } },
          { contentHash: { $eq: version.contentHash } },
        ],
      },
    });

    const documents = results.documents?.[0] ?? [];
    const metadatas = results.metadatas?.[0] ?? [];
    const distances = results.distances?.[0] ?? [];
    const ids = results.ids?.[0] ?? [];
    return documents
      .map((document, index): RetrievedSolutionChunk | null => {
        if (!document) return null;
        const metadata = metadatas[index];
        const similarity = 1 - Number(distances[index] ?? 1);
        if (!metadata || similarity < 0.7) return null;
        return {
          id: ids[index],
          symbol: String(metadata.symbol ?? 'unknown'),
          file: String(metadata.file ?? 'unknown'),
          code: document,
          startLine: Number(metadata.startLine ?? 0),
          endLine: Number(metadata.endLine ?? 0),
          similarity,
          embeddingModel: String(metadata.embeddingModel ?? version.embeddingModel),
          chunkerVersion: String(metadata.chunkerVersion ?? version.chunkerVersion),
          chunkType: String(metadata.chunkType ?? 'FUNCTION'),
        };
      })
      .filter((chunk): chunk is RetrievedSolutionChunk => chunk !== null)
      .slice(0, 4);
  }
}
