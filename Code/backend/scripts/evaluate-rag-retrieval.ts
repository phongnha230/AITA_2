import fs from 'node:fs/promises';
import { z } from 'zod';
import { ChromaVectorService } from '../src/modules/ai/infrastructure/vector/chroma-vector.service.js';

const caseSchema = z.object({
  name: z.string().min(1),
  query: z.string().min(1).max(8_192),
  expectedChunkIds: z.array(z.string().min(1)).min(1),
  version: z.object({
    assignmentId: z.string().min(1),
    solutionId: z.string().min(1),
    contentHash: z.string().length(64),
    environment: z.string().min(1),
    embeddingModel: z.string().min(1),
    chunkerVersion: z.string().min(1),
  }),
});

async function main(): Promise<void> {
  const datasetPath = process.env.RAG_GOLDEN_DATASET;
  if (!datasetPath) throw new Error('RAG_GOLDEN_DATASET must point to a reviewed golden JSON dataset.');
  const cases = z.array(caseSchema).min(1).parse(JSON.parse(await fs.readFile(datasetPath, 'utf8')));
  const vectorStore = new ChromaVectorService();
  let recalled = 0;
  let expected = 0;
  for (const testCase of cases) {
    const retrieved = await vectorStore.queryRelevantChunks(testCase.version, testCase.query);
    const retrievedIds = new Set(retrieved.slice(0, 4).map((chunk) => chunk.id));
    recalled += testCase.expectedChunkIds.filter((id) => retrievedIds.has(id)).length;
    expected += testCase.expectedChunkIds.length;
  }
  const recallAt4 = expected === 0 ? 0 : recalled / expected;
  console.log(JSON.stringify({ event: 'rag_golden_evaluation', cases: cases.length, recallAt4 }));
  if (recallAt4 < 0.8) throw new Error(`RAG Recall@4 ${recallAt4.toFixed(3)} is below 0.80.`);
}

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({
    event: 'rag_golden_evaluation_failed',
    error: error instanceof Error ? error.message : String(error),
  }));
  process.exitCode = 1;
}
