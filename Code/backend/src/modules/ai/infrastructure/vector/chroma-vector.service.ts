import { ChromaClient, Collection } from 'chromadb';
import { env } from '../../../../infrastructure/config/env.js';
import { CodeChunk } from '../chunking/code-chunker.js';

export class ChromaVectorService {
  private client: ChromaClient;
  private collectionName = 'aita_solution_code_chunks';
  private collection: Collection | null = null;
  private isAvailable = false;

  constructor() {
    this.client = new ChromaClient({
      path: env.CHROMA_DB_URL || 'http://localhost:8000',
    });
  }

  /**
   * Khởi tạo kết nối & Collection trong ChromaDB
   */
  private async getCollection(): Promise<Collection | null> {
    if (this.collection) return this.collection;

    try {
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: 'AITA PE Exam Solutions Function Chunks for RAG Grading' },
      });
      this.isAvailable = true;
      return this.collection;
    } catch (err: any) {
      console.warn(`[ChromaVectorService] ⚠️ ChromaDB không khả dụng tại ${env.CHROMA_DB_URL}: ${err.message}. Sử dụng Fallback in-memory.`);
      this.isAvailable = false;
      return null;
    }
  }

  /**
   * Lưu các đoạn code chunk của bài giải mẫu vào ChromaDB
   */
  public async indexSolutionChunks(
    assignmentId: string,
    chunks: CodeChunk[],
    environment: string
  ): Promise<void> {
    if (chunks.length === 0) return;

    const collection = await this.getCollection();
    if (!collection) {
      return; // Không kết nối được ChromaDB, hệ thống vẫn hoạt động bằng fallback
    }

    try {
      const ids = chunks.map((c) => `${assignmentId}_${c.id}`);
      const documents = chunks.map(
        (c) => `// Function: ${c.name} (${c.type})\n${c.code}`
      );
      const metadatas = chunks.map((c) => ({
        assignmentId,
        chunkId: c.id,
        functionName: c.name,
        startLine: c.startLine,
        endLine: c.endLine,
        environment,
      }));

      // Xóa các chunk cũ của assignment này (nếu có cập nhật đề)
      try {
        await collection.delete({
          where: { assignmentId: { $eq: assignmentId } },
        });
      } catch {
        // Bỏ qua nếu chưa có
      }

      await collection.add({
        ids,
        documents,
        metadatas,
      });

      console.log(`[ChromaVectorService] ✅ Đã đánh chỉ mục ${chunks.length} chunks cho bài thi ${assignmentId} vào ChromaDB.`);
    } catch (err: any) {
      console.error('[ChromaVectorService] Lỗi khi lưu chunks vào ChromaDB:', err.message);
    }
  }

  /**
   * Truy vấn tìm các hàm đáp án chuẩn liên quan nhất tới lỗi của sinh viên
   */
  public async queryRelevantChunks(
    assignmentId: string,
    queryText: string,
    topK = 2
  ): Promise<Array<{ name: string; code: string; distance?: number }>> {
    const collection = await this.getCollection();
    if (!collection) {
      return [];
    }

    try {
      const results = await collection.query({
        queryTexts: [queryText],
        nResults: topK,
        where: { assignmentId: { $eq: assignmentId } },
      });

      if (!results.documents || results.documents.length === 0 || !results.documents[0]) {
        return [];
      }

      const docs = results.documents[0];
      const metas = results.metadatas ? results.metadatas[0] : [];
      const distances = results.distances ? results.distances[0] : [];

      const relevantChunks: Array<{ name: string; code: string; distance?: number }> = [];

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        if (doc) {
          const meta = metas[i] as any;
          const dist = distances && distances[i] !== null && distances[i] !== undefined ? Number(distances[i]) : undefined;
          relevantChunks.push({
            name: meta?.functionName || 'Unknown',
            code: doc,
            distance: dist,
          });
        }
      }

      return relevantChunks;
    } catch (err: any) {
      console.warn('[ChromaVectorService] Lỗi truy vấn ChromaDB:', err.message);
      return [];
    }
  }
}
